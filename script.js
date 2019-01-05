HTMLElement.prototype.removeAllChildren = function () {
	// No idea what the best way to do this is.
	// Lots of discussion in the comments at https://stackoverflow.com/q/3955229/5252017
	while (this.lastChild) {
		this.removeChild(this.lastChild);
	}
}

function main(){
	var entryForm = document.querySelector("dialog#entry form");
	entryForm.addEventListener("submit", dataProvided);
}

document.addEventListener("DOMContentLoaded", main);

async function dataProvided(e){
	var textArea = e.target.getElementsByTagName("textarea")[0];
	var items = parseItems(textArea.value);
	var preferenceDialog = document.querySelector("dialog#preference");
	preferenceDialog.setAttribute("open", "open");
	
	var buttons = preferenceDialog.querySelectorAll("input[type=button]");
	async function lessthan(a, b){
		buttons[0].value = a;
		buttons[1].value = b;
		var better_value = await comparisonMade();
		if (a === better_value)
			console.log(b, "<", a);
		else {
			console.log(a, "<", b);
		}
		// Move better items to the start of the array (top of the output list)
		return a === better_value;
	}
	qsort(items, lessthan).then( () => preferencesFinished(items));
}

function preferencesFinished(items){
	var preferenceDialog = document.querySelector("dialog#preference");
	preferenceDialog.removeAttribute("open");
	var resultsDialog = document.querySelector("dialog#results");
	resultsDialog.setAttribute("open", "open");
	var ol = resultsDialog.getElementsByTagName("ol")[0];
	ol.removeAllChildren();
	for (var item of items){
		var li = document.createElement("li");
		li.innerText = item;
		ol.appendChild(li);
	}
}

async function comparisonMade() {
	// From https://stackoverflow.com/a/44746691/5252017
	var preferenceForm = document.querySelector("dialog#preference form");
	return new Promise(resolve => 
		preferenceForm.addEventListener("click", function(e){
			resolve(e.target.value);
		}, {once:true})
	);
}

// From https://en.wikipedia.org/wiki/Quicksort#Lomuto_partition_scheme
async function qsort(array, lessthan){
	await qsort_internal(array, 0, array.length - 1, lessthan);
}

async function qsort_internal(array, low, high, lessthan) {
	if (low < high){
		const p = await qsort_partition(array, low, high, lessthan);
		qsort_internal(array, low, p - 1, lessthan);
		qsort_internal(array, p + 1, high, lessthan);
	}
}

async function qsort_partition(array, low, high, lessthan){
	const pivot = array[high];
	var i = low;
	for (var j = low; j < high; j++){
		if (await lessthan(array[j], pivot)) {
			if (i != j) {
				swap(array, i, j);
			}
			i++;
		}
	}
	swap(array, i, high);
	return i;
}

function swap(array, i, j){
	const temp = array[j];
	array[j] = array[i];
	array[i] = temp;
}

function parseItems(input){
	var items = new Set(
		input.split("\n")
			.map(entry => entry.trim())
			.filter(entry => entry.length > 0)
	);
	return [...items];
}