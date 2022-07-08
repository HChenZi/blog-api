import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import moment from "moment";
import {Article, Category, Comment, Config, User} from "./models.js";
import {deleteEmptyCategory, selectCategories} from "./utils.js";

const app = express();
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({extended: true, limit: "100mb"}));
dotenv.config();

//初始化
app.post("/api/init", async (req, res) => {
    if (await User.findOne() || await Config.findOne()) {
        return res.status(400).send({message: "已经初始化过了"});
    }
    const user = new User({
        username: req.body.username, password: bcrypt.hashSync(req.body.password, 10),
    });

    await user.save();
    const config = new Config({
        title: req.body.title,
    });
    await config.save();
    return res.status(200).send({message: "初始化成功"});
});

//登录
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({username: req.body.username});
    if (!user) {
        return res.status(400).send({message: "用户名不存在"});
    }
    if (!await bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(400).send({message: "密码错误"});
    }
    const jwt_token = jsonwebtoken.sign({
        id: String(user._id),
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        ip: req.ip,
        user_agent: req.headers['user-agent'],
    }, process.env.JWT_SECRET);
    res.setHeader('Authorization', jwt_token);
    res.status(200).send({message: "登录成功"});
});

//根据分页获取文章列表
app.get('/api/articles', async (req, res) => {
    let articles = await Article.find().sort({updated_at: -1});
    await selectCategories(articles);
    res.status(200).send({
        message: "获取成功", data: articles.map(article => {
            let ret = {};
            ret.title = article.title;
            !req.query.details && (ret.date = article.updated_at);
            req.query.details && (ret.created_at = moment(article.created_at).format("Y-M-D h:mm:ss"));
            req.query.details && (ret.updated_at = moment(article.updated_at).format("Y-M-D h:mm:ss"));
            req.query.details && (ret.category = article.category);
            req.query.details && (ret.num_comments = article.comments.length);
            req.query.details && (ret.key = article.title);
            req.query.details && (ret.views = article.views);
            return ret;
        })
    });

});
//根据分类，分页获取文章列表
app.get('/api/articles/:category', async (req, res) => {
    const category = await Category.findOne({name: req.params.category});
    if (!category) {
        return res.status(404).send({message: "分类不存在"});
    }
    const articles = await Article.find({category: category._id}).sort({created_at: -1});
    res.status(200).send({
        message: "获取成功", data: articles.map(article => {
            let ret = {};
            ret.title = article.title;
            ret.date = article.created_at;
            return ret;
        })
    });
});

//获取分类列表
app.get('/api/categories', async (req, res) => {
    const categories = await Category.find();
    res.send(categories.map(category => category.name));
});
//获取文章详情
app.get('/api/article/:title', async (req, res) => {
    const article = await Article.findOneAndUpdate({title: req.params.title}, {$inc: {views: 1}});
    if (!article) {
        return res.status(404).send({message: "文章不存在"});
    }
    let comments = await Comment.find({article: article._id}).sort({created_at: -1});
    res.status(200).send({
        message: "获取成功", data: {
            category: (await Category.findById(article.category)).name,
            title: article.title,
            content: article.content,
            created_at: article.created_at,
            updated_at: article.updated_at,
            comments: comments && comments.map(comment => {
                let ret = {};
                ret.content = comment.content;
                ret.created_at = comment.created_at;
                ret.comment_author = comment.comment_author;
                return ret;
            })
        }
    });
});

//添加评论
app.post('/api/comment', async (req, res) => {
    const comment = await new Comment({
        comment_author: req.body.comment_author, content: req.body.content,
    }).save()
    Article.findOne({title: req.body.title}).then(article => {
        article.comments.push(comment);
        article.save();
    });
    res.status(200).send({message: "评论成功"});
});

//获得评论列表
app.get('/api/comments/:title', async (req, res) => {
    const article = await Article.findOne({title: req.params.title});
    const comments = [];
    for (const commentId of article.comments) {
        comments.push(await Comment.findById(commentId));
    }
    res.status(200).send({message: "评论获取成功", data: comments});
})

//获取配置
app.get("/api/config", async (req, res) => {
    const config = await Config.findOne();
    res.status(200).send({
        title: config.title, description: config.description, keywords: config.keywords,
    });
});

const auth = async (req, res, next) => {
    if (Boolean(process.env.DEBUG)) {
        console.info("DEBUG模式，后台管理功能免登录")
        return next();
    }
    if (!req.headers.authorization) {
        return res.status(401).send({message: "未授权"});
    }
    try {
        const token = req.headers.authorization.split(" ").pop();
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (decoded.ip !== req.ip || decoded.user_agent !== req.headers['user-agent'] || decoded.exp < Math.floor(Date.now() / 1000) || decoded.id !== String((await User.findById(decoded.id))._id)) {
            return res.status(401).send({message: "没有权限"});
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({message: "没有权限"});
    }
}
//需验证token
//添加文章
app.post('/api/article', auth, async (req, res) => {
    if (!req.body.title || !req.body.content || !req.body.category) {
        return res.status(400).send({message: "标题，内容，分类不能为空"});
    }
    const temp = await Article.findOne({title: req.body.title});
    if (req.body.title === (temp && temp.title)) {
        return res.status(400).send({message: "标题已存在"});
    }
    let category = await Category.findOne({name: req.body.category});
    //分类不存在时，新增分类
    if (!category) {
        category = await new Category({name: req.body.category}).save();
    }
    await new Article({
        title: req.body.title, content: req.body.content, category: category._id,
    }).save();

    res.status(200).send({message: "添加成功"});
});

//修改文章
app.put('/api/article/:title', auth, async (req, res) => {
    await Article.findByIdAndUpdate(req.params.id, {
        content: req.body.content, updated_at: Date.now()
    });
    res.status(200).send({message: "更新成功"});
});

//删除文章
app.delete('/api/article/:title', auth, async (req, res) => {
    Article.findOneAndDelete({title: req.params.title});
    deleteEmptyCategory();
    res.status(200).send({message: "删除成功"});
});

//删除评论
app.delete('/api/comment/:id', auth, async (req, res) => {
    await Comment.findByIdAndRemove(req.params.id);
    Article.findById(req.body.article).then(article => {
        article.comments.pull(req.params.id);
        article.save();
    });
    res.status(200).send({message: "删除成功"});
});

//修改用户名或密码
app.put('/api/user', auth, async (req, res) => {
    User.findOneAndUpdate({}, {
        username: req.body.username && req.body.username, password: req.body.password && req.body.password
    }).then(() => {
        res.status(200).send({message: "修改成功"})
    })

})

//修改站点名称
app.put('/api/config', auth, async (req, res) => {
    await Config.findOneAndUpdate({}, {
        title: req.body.title,
    });
    res.status(200).send({message: "更新成功"});
});

app.listen(process.env.PORT && 4000, () => {
    "Server started";
});
