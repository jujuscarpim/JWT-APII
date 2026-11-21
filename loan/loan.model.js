const {DataTypes}=require('sequelize'); const db=require('../config/db');
module.exports=db.define('Loan',{
 loanDate:{type:DataTypes.DATEONLY,allowNull:false},dueDate:{type:DataTypes.DATEONLY,allowNull:false},
 returnDate:DataTypes.DATEONLY,status:{type:DataTypes.ENUM('ATIVO','DEVOLVIDO','ATRASADO'),defaultValue:'ATIVO'},
 fine:{type:DataTypes.DECIMAL(10,2),defaultValue:0}
});
