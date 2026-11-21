const {Router}=require('express');const {Reader,Loan,Book}=require('../models');
const {asyncRoute,fail,posId}=require('../errors');const {authenticate}=require('../auth/auth.middleware');
const r=Router();r.use(authenticate);
r.get('/:id/loans',asyncRoute(async(req,res)=>{const id=posId(req.params.id,'ID');if(!await Reader.findByPk(id))fail(404,'Leitor não encontrado.');res.json(await Loan.findAll({where:{readerId:id},include:[Book],order:[['loanDate','DESC']]}));}));
r.use(require('./reader.controller'));module.exports=r;
