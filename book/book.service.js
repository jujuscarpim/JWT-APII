const {Op}=require('sequelize');const {Book,Category,Author,Loan,db}=require('../models');
const {str,posId,natural,fail}=require('../errors');
const incl=[Category,{model:Author,through:{attributes:[]}}];
function parse(b){
 const title=str(b.title,'Título'),isbn=str(b.isbn,'ISBN');
 const year=natural(b.year,'Ano'),totalCopies=natural(b.totalCopies,'Quantidade');
 const categoryId=posId(b.categoryId,'Categoria');
 if(!Array.isArray(b.authorIds)||!b.authorIds.length)fail(400,'Selecione pelo menos um autor.');
 const authorIds=b.authorIds.map(id=>posId(id,'Autor'));
 if(new Set(authorIds).size!==authorIds.length)fail(400,'Autor repetido.');
 return {title,isbn,year,totalCopies,categoryId,authorIds};
}
async function checkRelations(data,t){
 if(!await Category.findByPk(data.categoryId,{transaction:t}))fail(400,'Categoria não encontrada.');
 const authors=await Author.findAll({where:{id:{[Op.in]:data.authorIds}},transaction:t});
 if(authors.length!==data.authorIds.length)fail(400,'Autor não encontrado.');return authors;
}
async function list(filters){
 const where={};if(filters.title)where.title={[Op.like]:`%${filters.title}%`};
 if(filters.categoryId)where.categoryId=posId(filters.categoryId,'Categoria');
 if(filters.available==='true')where.availableCopies={[Op.gt]:0};
 const opts={where,include:incl,order:[['title','ASC']]};
 if(filters.authorId)opts.where.id={[Op.in]: (await Book.findAll({include:[{model:Author,where:{id:posId(filters.authorId,'Autor')},attributes:['id']}],attributes:['id']})).map(b=>b.id)};
 return Book.findAll(opts);
}
async function create(body){const data=parse(body);return db.transaction(async t=>{
 const authors=await checkRelations(data,t);
 const book=await Book.create({...data,availableCopies:data.totalCopies},{transaction:t});
 await book.setAuthors(authors,{transaction:t});return Book.findByPk(book.id,{include:incl,transaction:t});
});}
async function update(id,body){const data=parse(body);return db.transaction(async t=>{
 const book=await Book.findByPk(posId(id,'ID'),{transaction:t});if(!book)fail(404,'Livro não encontrado.');
 const authors=await checkRelations(data,t);const emprestados=book.totalCopies-book.availableCopies;
 if(data.totalCopies<emprestados)fail(409,'Total menor que livros emprestados.');
 await book.update({...data,availableCopies:data.totalCopies-emprestados},{transaction:t});
 await book.setAuthors(authors,{transaction:t});return Book.findByPk(book.id,{include:incl,transaction:t});
});}
async function remove(id){return db.transaction(async t=>{
 const book=await Book.findByPk(posId(id,'ID'),{transaction:t});if(!book)fail(404,'Livro não encontrado.');
 if(await Loan.count({where:{bookId:book.id},transaction:t}))fail(409,'Livro possui histórico de empréstimos.');
 await book.setAuthors([],{transaction:t});await book.destroy({transaction:t});
});}
module.exports={list,create,update,remove,incl};
