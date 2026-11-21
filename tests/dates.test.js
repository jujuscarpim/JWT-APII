const {test}=require('node:test');const {strict:assert}=require('node:assert');
const {daysLate}=require('../loan/loan.service');
test('multa é R$1 por dia após vencimento',()=>{assert.equal(daysLate('2026-11-10','2026-11-13'),3);assert.equal(daysLate('2026-11-10','2026-11-10'),0)});
