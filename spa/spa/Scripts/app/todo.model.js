//
// The Models in the new SPA template have a lot of great changes in them. 
// In fact, the JavaScript is where most of the changes are. 
// It starts with the Immediately Invoked Function Execution (IIFE) concept. 
// IIFE wrap the entire model with a function and execute it immediately.
//
// The code below shows the model is wrapped in function which accepts 2 parameters. 
// These parameters are its outside dependencies: Knockout and the datacontext module.
//
// This version of the model in the latest SPA template is cleaner the the previous 
// one because it mostly handles the members of the model. It leaves things like saving 
// and deleting to the datacontext module. In other words, the models just know about 
// their data but not how to get or save their data. I say “mostly” because this model 
// still has a save method, even though it defers it to the datacontext. 
// 
// What would I do? In my code I tend to move that logic to the datacontext. 
// Models know about their properties and datacontext knows how to manage the data. 
// In this simple 1 page and 1 view sample, it’s not a big deal. But when you get to larger 
// apps, this separation can make a positive difference. I’ll be exploring that in my 
// upcoming Pluralsight course on SPA fundamentals (date TBD).
//

(function (ko, datacontext) {
    datacontext.todoItem = todoItem;
    datacontext.todoList = todoList;

    // The TodoItem function is a constructor for an object that has properties for 
    // the Todo model (Title, IsDone, TodoItemId, etc) that are mapped from the DTO 
    // passed from the Web API. 
    //
    // It also has some additional members that are not derived form the server nor 
    // the DTO such as a save method and a ErrorMessage property. The ErrorMessage 
    // property is an observable that can be set to display validation information 
    // about the object. The save method defers the save to a method in the datacontext 
    // module (more on that in a moment) which returns a promise.

    function todoItem(data) {
        var self = this;
        data = data || {};

        self.todoItemId = data.todoItemId;
        self.title = ko.observable(data.title);
        self.isDone = ko.observable(data.isDone);
        self.todoListId = data.todoListId;

        self.errorMessage = ko.observable();

        saveChanges = function () {
            return datacontext.saveChangedTodoItem(self);
        };

        // Auto-save when these properties change
        self.isDone.subscribe(saveChanges);
        self.title.subscribe(saveChanges);

        self.toJson = function () { return ko.toJSON(self) };
    };

    function todoList(data) {
        var self = this;
        data = data || {};

        self.todoListId = data.todoListId;
        self.userId = data.userId || "to be replaced";
        self.title = ko.observable(data.title || "My todos");
        self.todos = ko.observableArray(importTodoItems(data.todos));

        self.isEditingListTitle = ko.observable(false);
        self.newTodoTitle = ko.observable();
        self.errorMessage = ko.observable();

        self.deleteTodo = function () {
            var todoItem = this;
            return datacontext.deleteTodoItem(todoItem)
                 .done(function () { self.todos.remove(todoItem); });
        };

        // Auto-save when these properties change
        self.title.subscribe(function () {
            return datacontext.saveChangedTodoList(self);
        });

        self.toJson = function () { return ko.toJSON(self) };
    };

    // convert raw todoItem data objects into array of TodoItems
    function importTodoItems(todoItems) {
        /// <returns value="[new todoItem()]"></returns>
        return $.map(todoItems || [],
                function (todoItemData) {
                    return datacontext.createTodoItem(todoItemData);
                });
    }

    todoList.prototype.addTodo = function () {
        var self = this;
        if (self.newTodoTitle()) { // need a title to save
            var todoItem = datacontext.createTodoItem(
                {
                    title: self.newTodoTitle(),
                    todoListId: self.todoListId
                });
            self.todos.push(todoItem);
            datacontext.saveNewTodoItem(todoItem);
            self.newTodoTitle("");
        }
    };
})(ko, todoApp.datacontext);