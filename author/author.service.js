const {Author,Book}=require('../models');const {str,date,fail}=require('../errors');const crud=require('../crud');
module.exports=crud({Model:Author,validate:b=>({name:str(b.name,'Nome'),nationality:str(b.nationality,'Nacionalidade',false),birthDate:b.birthDate?date(b.birthDate,'Nascimento'):null}),checkDelete:async one=>{if(await one.countBooks())fail(409,'Autor possui livros vinculados.');}});
