const {Router}=require('express');const {Book}=require('../models');const s=require('./book.service');
const {asyncRoute,fail,posId}=require('../errors');const {authenticate,isAdmin}=require('../auth/auth.middleware');
const r=Router();r.use(authenticate);
r.get('/',asyncRoute(async(req,res)=>res.json(await s.list(req.query))));
r.get('/:id',asyncRoute(async(req,res)=>{const book=await Book.findByPk(posId(req.params.id,'ID'),{include:s.incl});if(!book)fail(404,'Livro não encontrado.');res.json(book);}));
r.post('/',isAdmin,asyncRoute(async(req,res)=>res.status(201).json(await s.create(req.body))));
r.put('/:id',isAdmin,asyncRoute(async(req,res)=>res.json(await s.update(req.params.id,req.body))));
r.delete('/:id',isAdmin,asyncRoute(async(req,res)=>{await s.remove(req.params.id);res.json({message:'Livro excluído.'});}));
module.exports=r;
