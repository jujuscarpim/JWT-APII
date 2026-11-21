const {Op}=require('sequelize');const {db,Loan,Book,Reader,User}=require('../models');
const {fail,posId}=require('../errors');
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(s,days)=>new Date(Date.parse(s+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
const daysLate=(due,end)=>Math.max(0,Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));
function computedStatus(loan,now=today()){return loan.returnDate?'DEVOLVIDO':loan.dueDate<now?'ATRASADO':'ATIVO';}
async function list(status){const rows=await Loan.findAll({include:[Book,Reader,User],order:[['id','DESC']]});return rows.map(l=>({...l.toJSON(),status:computedStatus(l)})).filter(l=>!status||l.status===status);}
async function borrow(body,userId){const bookId=posId(body.bookId,'Livro'),readerId=posId(body.readerId,'Leitor');return db.transaction(async t=>{
 const book=await Book.findByPk(bookId,{transaction:t});if(!book)fail(404,'Livro não encontrado.');
 const reader=await Reader.findByPk(readerId,{transaction:t});if(!reader)fail(404,'Leitor não encontrado.');
 const active=await Loan.findAll({where:{readerId,returnDate:null},transaction:t});
 if(active.length>=3)fail(409,'Limite de 3 empréstimos ativos por leitor.');
 if(active.some(l=>l.dueDate<today()))fail(409,'Leitor tem empréstimo atrasado.');
 const [affected]=await Book.update({availableCopies:db.literal('availableCopies - 1')},{where:{id:bookId,availableCopies:{[Op.gt]:0}},transaction:t});
 if(!affected)fail(409,'Livro sem exemplares disponíveis.');
 const loanDate=today();const loan=await Loan.create({loanDate,dueDate:addDays(loanDate,7),status:'ATIVO',fine:0,readerId,bookId,userId},{transaction:t});
 return loan;
});}
async function giveBack(id){return db.transaction(async t=>{
 const loan=await Loan.findByPk(posId(id,'ID'),{transaction:t});if(!loan)fail(404,'Empréstimo não encontrado.');
 if(loan.returnDate)fail(409,'Livro já devolvido.');
 const returnDate=today(),fine=daysLate(loan.dueDate,returnDate);
 await loan.update({returnDate,status:'DEVOLVIDO',fine},{transaction:t});
 await Book.increment('availableCopies',{where:{id:loan.bookId},by:1,transaction:t});
 return loan;
});}
module.exports={list,borrow,giveBack,computedStatus,daysLate};
