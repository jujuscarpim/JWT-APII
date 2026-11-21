const {Category,Book}=require('../models');const {str,fail}=require('../errors');const crud=require('../crud');
module.exports=crud({Model:Category,fields:['name','description'],validate:b=>({name:str(b.name,'Nome'),description:str(b.description,'Descrição',false)}),checkDelete:async one=>{if(await Book.count({where:{categoryId:one.id}}))fail(409,'Categoria possui livros vinculados.');}});
