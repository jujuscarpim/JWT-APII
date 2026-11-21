const {Router}=require('express');const {authenticate}=require('../auth/auth.middleware');
const {asyncRoute}=require('../errors');const s=require('./loan.service');
const r=Router();r.use(authenticate);
r.get('/',asyncRoute(async(req,res)=>res.json(await s.list(req.query.status))));
r.post('/',asyncRoute(async(req,res)=>res.status(201).json(await s.borrow(req.body,req.user.id))));
r.patch('/:id/return',asyncRoute(async(req,res)=>res.json(await s.giveBack(req.params.id))));
module.exports=r;
