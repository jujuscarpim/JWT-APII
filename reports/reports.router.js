const {Router}=require('express');const {Book,Loan,Reader}=require('../models');
const {asyncRoute}=require('../errors');const {authenticate,isAdmin}=require('../auth/auth.middleware');
const {computedStatus}=require('../loan/loan.service');const r=Router();r.use(authenticate,isAdmin);
r.get('/dashboard',asyncRoute(async(req,res)=>{
 const loans=await Loan.findAll();res.json({totalBooks:await Book.count(),totalCopies:await Book.sum('totalCopies')||0,
 readers:await Reader.count(),activeLoans:loans.filter(l=>!l.returnDate).length,
 lateLoans:loans.filter(l=>computedStatus(l)==='ATRASADO').length,
 fines:Number(loans.reduce((s,l)=>s+Number(l.fine||0),0).toFixed(2))});
}));module.exports=r;
