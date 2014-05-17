//essai de mettre une tache de schedule
var st = require('./every20.js');
var schedule = require('node-schedule');
console.log("Je suis en cours d'execution");	
	var rule = new schedule.RecurrenceRule();
    rule.second = 10;
	
	
	var j = schedule.scheduleJob(rule, function(){
		console.log('The answer to life, the universe, and everything!');
		st.s();
	});