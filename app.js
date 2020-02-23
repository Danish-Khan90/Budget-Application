
/*****
 * Budget Controller
 * It should be a proper data structure as constructed below
 * We need to use objects and arrays in an efficient way
 */
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(){

        if (data.allTotals.inc > 0) {
            this.percentage = Math.round((this.value / data.allTotals.inc) * 100);
        } else {
            this.percentage = -1;
        }
    } 

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [] 
        },
        allTotals: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentageIncome: -1
    }

    calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.allTotals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //[1,2,3,4,5]. next ID = 6
            //[1,2,3,6,8], next ID = 9
            //ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type] [data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
             
            // Create new item based on type 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else {
                newItem = new Income(ID, des, val);
            }
         
            // Return the new element
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
           // console.log(id, type);

            ids = data.allItems[type].map(function(current) {
                return current.id;
            }); 

            index = ids.indexOf(id);

            
            if (index !== -1) {

                data.allItems[type].splice(index, 1);
            }
        
        },


        testing: function() {
            console.log(data);
        },
        
        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: Income - Expenses
            data.budget = data.allTotals.inc - data.allTotals.exp;

            // calculate the percentage of income that we spent
            if(data.allTotals.inc > 0) {
                data.percentageIncome = Math.round((data.allTotals.exp / data.allTotals.inc) * 100);

            }
        },

        getBudget: function() {
            return {
                bud: data.budget,
                totalIncome: data.allTotals.inc,
                totalExpenses: data.allTotals.exp, 
                perIncome: data.percentageIncome
            };
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage();
            })
        }

    }

})();


// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'  
    };

    return {
        getInput : function() {
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function(selectorID) {

                var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
                
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.bud;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExpenses;
            
            if (obj.perIncome > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.perIncome + '%';      
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        
        },

        getDOMStrings : function() {
            return DOMStrings;
        }
    }

})();

// GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function() {

        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
1


    };

    var updateBudget = function() {

        // 1. Calculate the budget.
            budgetCtrl.calculateBudget();

        // 2. Return the budget.
            var budget = budgetCtrl.getBudget();

        // 3. Display the budget to the UI.
            UICtrl.displayBudget(budget);
    }


    var updatePercentages = function() {

        //1. Calculate the percentages.
        budgetCtrl.calculatePercentages();

        //2. Return the percentages.
        //var percentages = budgetCtrl.getPercentages();

        //3. Display the percentages to the UI.


    }

    var ctrlAddItem = function() {

        var input, newItem;
        // 1. Get the field input data.
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value >= 0) {

            // 2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI.
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields .
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentage
            updatePercentages();
        }        
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    
        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0],
            ID = parseInt(splitID[1]);
    }
    
        budgetCtrl.deleteItem(type, ID);

        UICtrl.deleteListItem(itemID);

        updateBudget();

        updatePercentages();

    }

    return {
        init: function() {
            UICtrl.displayBudget({
                bud: 0,
                totalIncome: 0,
                totalExpenses: 0,
                perIncome: 0
            });
            console.log('Application has started');
            setupEventListener();
        }
    }
   
})(budgetController,UIController);


controller.init();


