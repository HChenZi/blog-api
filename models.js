import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGODB_URI && "mongodb://localhost/blog");

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, set: (val) => bcrypt.hashSync(val, 10)},
});

const ArticleSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    content: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    category: {type: String, required: true},
    views: {type: Number, default: 0},
});

const CommentSchema = new mongoose.Schema({
    comment_author: {type: String, required: true},
    content: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
});

const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
});

const ConfigSchema = new mongoose.Schema({
    title: {type: String, required: true},
});

const User = mongoose.model('User', UserSchema);
const Article = mongoose.model('Article', ArticleSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const Category = mongoose.model('Category', CategorySchema);
const Config = mongoose.model('Config', ConfigSchema);

export {User, Article, Comment, Category, Config};
