function fail(status,message){const e=new Error(message);e.status=status;throw e;}
function asyncRoute(fn){return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);}
function handleErrors(err,req,res,next){
 if(err.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Registro duplicado: nome, CPF, ISBN ou e-mail já cadastrado.'});
 if(err.name==='SequelizeForeignKeyConstraintError')return res.status(409).json({error:'Este registro tem vínculos e não pode ser excluído.'});
 if(err.name==='SequelizeValidationError')return res.status(400).json({error:err.errors.map(x=>x.message).join('; ')});
 if(err.name==='SyntaxError'&&err.status===400)return res.status(400).json({error:'JSON inválido.'});
 if(!err.status || err.status>=500)console.error(err);
 return res.status(err.status||500).json({error:err.status?err.message:'Erro interno do servidor.'});
}
function str(v,name,required=true){if((v==null||v==='')&&!required)return null;if(typeof v!=='string'||!v.trim())fail(400,`${name} inválido.`);return v.trim();}
function posId(v,name){const n=Number(v);if(!Number.isSafeInteger(n)||n<=0)fail(400,`${name} inválido.`);return n;}
function natural(v,name,zero=true){const n=Number(v);if(v==null||v===''||!Number.isSafeInteger(n)||n<(zero?0:1))fail(400,`${name} inválido.`);return n;}
function date(v,name){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail(400,`${name} inválida.`);return v;}
module.exports={fail,asyncRoute,handleErrors,str,posId,natural,date};
