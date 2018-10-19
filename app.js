//Controls Budget and Data part
var budgetController = (function () {

    //Constructor Function for Expenses
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //calculates the expense percentage
    Expenses.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    //returns expense percentage
    Expenses.prototype.getPercentage = function () {
        return this.percentage;
    };

    //Constructor Function for Incomes
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Stores all the data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    };

    //Calculates the total
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.total[type] = sum;
    };
    
    return {
        //Function for adding data items
        addItem: function (type, des, val) {
            var ID, newItem;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Creates new data item
            if (type == "exp") {
                newItem = new Expenses(ID, des, val);
            } else if (type == "inc") {
                newItem = new Income(ID, des, val);
            }
            //It pushes our data item into array
            data.allItems[type].push(newItem);

            return newItem;
        },
        testing: function () {
            console.log(data);
        },
        //deletes Item from list
        deleteItem: function (type, Id) {
            var Ids, index;
            //create array of IDs
            Ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = Ids.indexOf(Id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        //Calculates budget
        calculateBudget: function () {
            calculateTotal("inc");
            calculateTotal("exp");
            data.budget = data.total.inc - data.total.exp;
            if (data.total.inc > 0) {
                data.percentage = (data.total.exp / data.total.inc) * 100;
            } else {
                data.percentage = -1;
            }
        },
        //calculates percentage for expense percentage
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.total.inc);
            });
        },
        //returns percentages
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        //Returns the budget related values as object
        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.total.inc,
                totalExp: data.total.exp
            };
        },
    }
})();


//Controls UI of the application
var uiController = (function () {
    //converts IDs into variables
    var DOMstring = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        totalIncome: ".budget__income--value",
        totalExpenses: ".budget__expenses--value",
        expensePercentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel:".budget__title--month"
    };
       
    //formats number for output
        var formatNumber= function(num,type){
            var numSplit,int,dec;
            num=Math.abs(num);
            num=num.toFixed(2);
            numSplit=num.split(".");
            int=numSplit[0];
            dec=numSplit[1];
            //adds comma to the number
            if(int.length>3)
                int=int.substr(0,int.length-3)+","+int.substr(int.length-3,3);
            return (type==="exp"?"-":"+")+" "+int+"."+dec;
            
        };
    //it iterates through each item of a list
       var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; ++i) {
                    callback(list[i], i);
                }
            };



    return {
        //Makes DOM strings public
        getDOMstring: function () {
            return DOMstring;
        },
        //Gets all the input values from the user
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value),
            };
        },
        //adds income or expense into the budget list
        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type == "inc") {
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type == "exp") {
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">5%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"</i></button></div></div></div>';
            }
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeEnd', html);

        },
        //deletes list item from UI
        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        //Clears input fields
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstring.inputDescription + "," + DOMstring.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, Array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        //changes HTML according to budget
        displayBudget: function (obj) {
            var type;
            obj.budget>0?type="inc":type="exp";
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstring.totalExpenses).textContent = formatNumber(obj.totalExp,"exp");
            document.querySelector(DOMstring.totalIncome).textContent = formatNumber(obj.totalInc,"inc");
            if (obj.percentage > 0){
                obj.percentage=Math.abs(obj.percentage);
                obj.percentage=obj.percentage.toFixed(0);
                document.querySelector(DOMstring.expensePercentage).textContent =obj.percentage + "%";
            }
            else
                document.querySelector(DOMstring.expensePercentage).textContent = "---";

        },
        //displays percentages
        displayPercentages: function (percentage) {
            var fields = document.querySelectorAll(DOMstring.expensesPercentageLabel);
            nodeListForEach(fields, function (current, index) {
                if (percentage[index] > 0)
                    current.textContent = percentage[index] + "%";
                else
                    current.textContent = "---";
            });
        },
        //displays the current month on screen
        displayMonth:function(){
            var now,year,month;
            now= new Date();
            year=now.getFullYear();
            month=now.getMonth();
            var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
            document.querySelector(DOMstring.dateLabel).textContent=months[month-1]+",  "+year;
        },
        //changes the box border color with type
        changedType:function(){
            var fields=document.querySelectorAll(DOMstring.inputType+","+DOMstring.inputDescription+","+DOMstring.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle("red-focus");
            });
        },
       
    };

})();


//Controls the whole application
var controller = (function (bCtrl, uCtrl) {
    //It sets up Event Listeners
    var setupEventListeners = function () {
        document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(input.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(input.inputType).addEventListener("change",uCtrl.changedType);

    };

    //It gets DOM strings
    var input = uCtrl.getDOMstring();

    //Updates the Budget
    var updateBudget = function () {
        bCtrl.calculateBudget();
        var budget = bCtrl.getBudget();
        uCtrl.displayBudget(budget);
    };
    //Adds Item to the list
    var ctrlAddItem = function () {
        var input, newItem;
        input = uCtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = bCtrl.addItem(input.type, input.description, input.value);
            uCtrl.addListItem(newItem, input.type);
            uCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };
    //updates expense percentage of list items
    updatePercentages = function () {
        bCtrl.calculatePercentages();
        var percentage;
        percentage = bCtrl.getPercentages();
        uCtrl.displayPercentages(percentage);
    };
    //Deletes Item from the list
    var ctrlDeleteItem = function (event) {
        var itemId, splitId;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split("-");
            type = splitId[0];
            Id = parseInt(splitId[1]);
        }
        bCtrl.deleteItem(type, Id);
        uCtrl.deleteListItem(itemId);
        updateBudget();
        updatePercentages();
    };

    return {
        init: function () {
            uCtrl.displayMonth();
            uCtrl.displayBudget({
                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, uiController);

//It initialises the application
controller.init();