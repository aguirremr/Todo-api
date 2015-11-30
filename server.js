var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;
    
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});        
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});        
    }
    
    if (queryParams.hasOwnProperty('q') && queryParams.q.length >0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
	res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{id: todoId});
    
    //var matchedTodo;    
    //todos.forEach(function (todo) {
    //    if (todoId === todo.id) {
    //        matchedTodo = todo;
    //    }
    //})
    
    if(matchedTodo) { //means if defined, otherwise undefined as defauled above
       res.json(matchedTodo);
    } else {
        res.status(404).send();
    }        
})

//POST /todis
app.post('/todos', function (req,res) {
   var body = _.pick(req.body,'description','completed');

   if (! _.isBoolean(body.completed) || ! _.isString(body.description) || body.description.trim().length === 0) {
       return res.status(400).send();
   }   
    
   body.description = body.description.trim();    
   body.id = todoNextId++;
   todos.push(body);
    
   console.log('description: ' + body.description);

   res.json(body);    
    
});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{id: todoId});

    
    if(!matchedTodo) { //means if defined, otherwise undefined as defauled above
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo)   
        res.json(matchedTodo);        
    }        
})

//PUT /todos/:id
app.put('/todos/:id', function (req,res) {
   var todoId = parseInt(req.params.id,10);
   var matchedTodo = _.findWhere(todos,{id: todoId});    
   var body = _.pick(req.body,'description','completed');
   var validattributes = {};
   
   if (!matchedTodo){
       return res.status(404).send(); //not found
   }    
    
   if (body.hasOwnProperty('completed') && _.isBoolean(body.completed) ){
       validattributes.completed = body.completed;
   } else if (body.hasOwnProperty('completed')) {
       return res.status(400).send(); //bad syntax
   }
    
   if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
       validattributes.description = body.description;
   } else if (body.hasOwnProperty('description')) {
       return res.status(400).send();
   }    
    
   //do the update since it went all the way here   
   _.extend(matchedTodo, validattributes);
   
   res.json(matchedTodo);
    
});


app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});