const s=require('./user.service');const {asyncRoute}=require('../errors');const {Router}=require('express');
const {authenticate,isAdmin}=require('../auth/auth.middleware');const r=Router();r.use(authenticate,isAdmin);
r.get('/',asyncRoute(async(req,res)=>res.json(await s.list())));
r.post('/',asyncRoute(async(req,res)=>res.status(201).json(await s.create(req.body))));
r.put('/:id',asyncRoute(async(req,res)=>res.json(await s.update(req.params.id,req.body))));
r.patch('/:id/active',asyncRoute(async(req,res)=>res.json(await s.setActive(req.params.id,req.body.active,req.user.id))));
module.exports=r;
