// The sample comes with a ViewModel named todoListViewModel (shown below). Think of it 
// as “The View’s Model”. The View needs data. The models store the data. But the data 
// is not in the format the view needs it in. So the ViewModel pulls the data from the 
// models together and presents it in a way that the View requires. This is also known 
// as the Model-View-ViewModel pattern (MVVM).
//
// The ViewModel also adds additional features such as awareness of the the models, 
// reference to the client side data services (todo.datacontext.js) for getting and 
// saving data in the models, and validation/error information. 
//
// It’s the presentation logic for the View.
//
// What changed here? This module also now implements an IIFE that wraps the entire 
// module. The module is executed and set to a variable todoApp.todoListViewModel.
// In my post on the previous version of the template I pointed out that this template 
// could benefit from using the Revealing Module Pattern. Well, in this new template 
// the viewmodel uses the Revealing Module Pattern to help hide internal logic and 
// expose the members that should be accessible externally. You can think of it as 
// a way to hide private members and expose a public API. The public API is easily 
// found by looking at lines 62-67 in the return statement. 
//
// The todoListViewModel exposes an object with 4 members:
//  todoLists is an observableArray of todo lists
//  error shows error information relative to the viewmodel
//  addTodoList adds a new todo list
//  deleteTodoList deletes an existing todo list
//

window.todoApp.todoListViewModel = (function (ko, datacontext) {
    /// <field name="todoLists" value="[new datacontext.todoList()]"></field>
    var todoLists = ko.observableArray(),
        error = ko.observable(),
        addTodoList = function () {
            var todoList = datacontext.createTodoList();
            todoList.isEditingListTitle(true);
            datacontext.saveNewTodoList(todoList)
                .then(addSucceeded)
                .fail(addFailed);

            function addSucceeded() {
                showTodoList(todoList);
            }
            function addFailed() {
                error("Save of new todoList failed");
            }
        },

        showTodoList = function (todoList) {
            todoLists.unshift(todoList); // Insert new todoList at the front
        },

        deleteTodoList = function (todoList) {
            todoLists.remove(todoList);
            datacontext.deleteTodoList(todoList)
                .fail(deleteFailed);

            function deleteFailed() {
                showTodoList(todoList); // re-show the restored list
            }
        };

    datacontext.getTodoLists(todoLists, error); // load todoLists

    return {
        todoLists: todoLists,
        error: error,
        addTodoList: addTodoList,
        deleteTodoList: deleteTodoList
    };

})(ko, todoApp.datacontext);

ko.applyBindings(window.todoApp.todoListViewModel);