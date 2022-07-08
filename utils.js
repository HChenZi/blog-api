import {Article, Category} from "./models.js";

// 对多个文章下的分类id去重，再在分类中查询
const selectCategories = async (articles) => {
    if (articles && articles.length) {
        let temp = {};
        articles.map((article) => {
            temp[article.category] = "";
        })
        for (const category of Object.keys(temp)) {
            const result = await Category.findById(category);
            temp[category] = result && result.name;
        }
        articles.map((article) => {
            article.category = temp[article.category];
        });
    }
}

const deleteEmptyCategory = async () => {
    let count = 0;
    const articles = (await Article.find()).map((article) => article.category);
    if (articles && articles.length) {
        const categories = (await Category.find()).map((category) => category._id);
        for (const categoryId of categories) {
            if (!articles.includes(categoryId)) {
                Category.findByIdAndDelete(categoryId);
                count++;
            }
        }
    }
    console.info(`删除了${count}个空分类`)
    return count;
}

export {selectCategories, deleteEmptyCategory}