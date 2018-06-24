//Budget Controller
var budgetController =(function(){

	var Expenses = function(id,description,value)
	{
			this.id=id;
			this.description=description;
			this.value=value;
	};
	var Income = function(id,description,value)
	{
			this.id=id;
			this.description=description;
			this.value=value;
	};

	var data= {
		    items : {
				inc: [],
				exp: []
			},
		    total : {
				inc: 0,
				exp: 0
			},
			budget: 0,
			percentage: -1
		};

		return {
			addItem: function(type,des,val)
			{
				var newItem,id;
				if(data.items[type].length>0)
				{
					id=data.items[type][data.items[type].length-1].id+1;
				}
				else{
					id=0;
				}

				if(type==='inc')
				{
					newItem = new Income(id,des,val);
				}
				else if(type==='exp')
				{
					newItem = new Expenses(id,des,val);
				}
				data.items[type].push(newItem);
				data.total[type]+=val;
				return newItem;
			},

			calculateBudget: function()
			{
				///Finding budget
				data.budget=data.total.inc-data.total.exp;
				//Finding percentage
				if(data.budget>0)
				data.percentage= Math.round((data.total.exp/data.total.inc)*100);
				else
					data.percentage=-1;
			},

			getBudget: function()
			{
				return {
					budget: data.budget,
					totalInc: data.total.inc,
					totalExp: data.total.exp,
					percentage: data.percentage
				};
			},

			deleteItem: function(type,id)
			{
				///1. find the array of the ids
				/// 1 5 6 8
				///we can get the temp id of the array and delete it from the data
				var ids = data.items[type].map(function(current)
				{
					return current.id;
				});
				// ids = [1 5 6 8]
				id= parseFloat(id);
				var index= ids.indexOf(id);
				if(index!==-1)
				{
					var temp= data.items[type][index].value;
					data.items[type].splice(index,1);
					data.total[type]-=temp;
				}
			},

			getPercentage: function(type,value)
			{
				var per=-1;
				var budget= data.budget
				if(type==='exp')
				{
					per = Math.round((value/budget)*100);
				}
				return per;
			},


			test: function()
			{
				console.log(data);
			}
	};
})();


//UI Controller
var UIController =(function(){
	var DOMString = {
		inputType: '.adder',
		inputDescription: '.description',
		inputValue: '.cost',
		inputBtn: '.add_btn',
		incomeContainer : '.income_list',
		expensesContainer: '.expenses_list',
		budgetLabel: '.budget_value',
		incomeLabel: '.income_value',
		expensesLabel: '.expenses_value',
		percentageLabel: '.expenses_per',
		container: '.container',
		date: '.title_month'
	};


		var formatNumber= function(num,type)
		{
			num=Math.abs(num);
			num=num.toFixed(2);
			var splitNum= num.split('.');
			var int,dec,pre;
			int=splitNum[0];
			dec=splitNum[1];
			var l=int.length;
			var temp= int.substr(l-3,3);
			if(type=='inc')
				pre='+ ';
			else if(type=='exp')
				pre='- ';
			else
				pre='';
			if(l>3)
			int=pre+int.substr(0,l-3)+','+temp+'.'+dec;
			else
				int=pre+int+'.'+dec;
			return int;
		};

		var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i]);
        }
    };

	return {
		getInput: function(){
				var val = parseFloat(document.querySelector(DOMString.inputValue).value);
				val = parseFloat(val.toFixed(2));
			return {
				type: (document.querySelector(DOMString.inputType).value),//value can be either inc or exp
				description: document.querySelector(DOMString.inputDescription).value,
				value: val
			};
		},

		addListItem: function(obj,type,per)
		{
				var html,newHtml,element;
				if(type==='inc')
				{
					element=DOMString.incomeContainer;
					html='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}
				else if(type==='exp')
				{

					element=DOMString.expensesContainer;
					html ='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">%21%</div><div class="item_delete"><button class="item_delete_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}
				///replacing values
				newHtml= html.replace('%id%',obj.id);
				newHtml= newHtml.replace('%description%',obj.description);
				newHtml= newHtml.replace('%value%',formatNumber(obj.value,type));
				if(type==='exp')
				{
					newHtml=newHtml.replace('%21%',per + '%');
				}

				document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},

		deleteItem(id)
		{
			var el= document.getElementById(id);
			el.parentNode.removeChild(el);
		},

		clearfields: function()
		{
			var fields = document.querySelectorAll(DOMString.inputDescription + ', '+ DOMString.inputValue);
			//converting fields which is a list to array
			var fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array)
			{
				current.value="";
			});
			//fieldsArr[0].focus();
            //console.log(fieldsArr[0]);
            document.querySelector(DOMString.inputDescription).focus();
		},

		displayBudget: function(obj)
		{
			var per,type;
			type = (obj.budget>=0)?'inc':'exp';
			document.querySelector(DOMString.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMString.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMString.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
			if(obj.percentage!=-1)
				per=obj.percentage+'%';
			else
				per='---';
			document.querySelector(DOMString.percentageLabel).textContent=per;

		},

		displayDate: function()
		{
			var now= new Date();
			var year= now.getFullYear();
			var month= now.getMonth();
			var m=['January', 'February','March','April','May','June','July','August','September','October','November','December'];
			document.querySelector(DOMString.date).textContent=m[month]+' '+year;
		},
		formatColor: function()
		{
			console.log('Changed');
			var fields=document.querySelectorAll(DOMString.inputType+','+DOMString.inputDescription+','+DOMString.inputValue);
			
			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMString.inputBtn).classList.toggle('red');
		},

		getDOMStrings: function()
			{ 	return DOMString;	
			}
	};




})();


///Global App Controller
var Controller = (function(budgetCtrl, UICtrl){

	var ctrlDeleteItem=function(event)
	{
		var item,type,id,temp;
		item= event.target.parentNode.parentNode.parentNode.parentNode.id;
		temp=item;
		item=item.split('-');
		type=item[0];
		id=item[1];
		budgetCtrl.deleteItem(type,id);
		UICtrl.deleteItem(temp);
		updateBudget();
	}

	var eventListeners= function()
	{
		var DOM= UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress', function(e){
			if(e.keyCode===13)
				ctrlAddItem();
		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		});
		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.formatColor);
	};

	var updateBudget = function()
	{
			///Calculate Budget
			budgetCtrl.calculateBudget();
			//return budget
			var budget=budgetCtrl.getBudget();
			UICtrl.displayBudget(budget);
			console.log(budget);
	};

	var updatePercentage = function(type,value)
	{
		//get percentage
		var per=budgetCtrl.getPercentage(type,value);
		return per;
		//update it on UI
	};

	var ctrlAddItem = function(){
		var input,nextItem,per;
		 //taking input from the UI
		 input = UICtrl.getInput();

		 if(input.description!=='' && !isNaN(input.value) && input.value!==0)
		 {
		 	 //creating list 
			 nextItem=budgetController.addItem(input.type,input.description,input.value);
		 	//updating the list on UI
		 	per=updatePercentage(input.type,input.value);

		 	UICtrl.addListItem(nextItem,input.type,per);
		 	//clearing the fields
		 	UICtrl.clearfields();
		 	//Update Budget
		 	updateBudget();
		 	//update percentage
		 }
	};

	return {
		init : function()
		{
				console.log('In init');
				UICtrl.displayDate();
				eventListeners();
				updateBudget();
		}		
	};

})(budgetController,UIController);
	
Controller.init();
