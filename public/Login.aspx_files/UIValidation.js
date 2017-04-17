function OnValidateInteger(source, arguments)
{
    if (ValidateInteger(arguments.Value))
        arguments.IsValid=true;
    else
        arguments.IsValid=false;
}

function OnValidateString(source, arguments)
{
    arguments.IsValid=true;
}

function OnValidateDouble(source, arguments)
{
    if (ValidateDouble(arguments.Value))
        arguments.IsValid=true;
    else
        arguments.IsValid=false;
}

function OnValidateDate(source, arguments)
{
    if (ValidateDate(arguments.Value))
        arguments.IsValid=true;
    else
        arguments.IsValid=false;
}

function OnValidateCurrency(source, arguments)
{
    if (ValidateCurrency(arguments.Value))
        arguments.IsValid=true;
    else
        arguments.IsValid=false;
}


function ValidateInteger(tsValue){
	var exp, op;
	op = tsValue;
    exp = /^\s*[-\+]?\d+\s*$/;
    if (op.match(exp) == null){ 
        return false;
    }else{
		return true;
    }
}

function ValidateDouble(tsValue){
	var exp, op;
	op = tsValue;
	exp = new RegExp("^\\s*([-\\+])?(\\d+)?(\\" + "." + "(\\d+))?\\s*$");
    if(op.match(exp)==null) return false;
    else return true;
}

function ValidateDate(tsValue){
	var exp, op,m,dateorder;
	op = tsValue;
    var yearFirstExp = new RegExp("^\\s*(\\d{4})([-./])(\\d{1,2})\\2(\\d{1,2})\\s*$");
    m=op.match(yearFirstExp);
    if(m==null){
		return false;
	}else{
		if (m != null && (m[1]>= 1900) && (m[3]<13 && m[3]>0) && (m[4]<32 && m[4] > 0))
			return true;
		else
			return false;
    }
}

function ValidateCurrency(tsValue){
	var exp;
	exp = new RegExp("^\\s*((((\\d+),)*(\\d+))|(\\d+)?)(\\.(\\d+))?\\s*$");
    if(tsValue.match(exp)==null) return false;
    else return true;
}

function CurrencyToNumber(tsCurrency){
	return parseFloat(vbReplace(tsCurrency, "," ,""));	
}

function NumberToCurrency(tnNumber){
	var tsNumber = new String(tnNumber);
	var lnPointIndex = tsNumber.indexOf(".", 0);
	var tsDecimalPart = "";
	var tsIntPart = "";
	var tsSection;
	if(lnPointIndex>=0){
		tsDecimalPart = tsNumber.substr(lnPointIndex+1, tsNumber.length-lnPointIndex-1);
	}else{
		lnPointIndex = tsNumber.length;
	}

	for(var lnIndex=lnPointIndex-3; lnIndex>=0; lnIndex=lnIndex-3){
		tsSection = tsNumber.substr(lnIndex, 3);
		if(tsIntPart!="") tsIntPart = tsSection + "," + tsIntPart;
		else tsIntPart = tsSection;
	}
	if(lnIndex!=-3){
		tsSection = tsNumber.substr(0, 3+lnIndex);
		if(tsIntPart!="") tsIntPart = tsSection + "," + tsIntPart;
		else tsIntPart = tsSection;
	}
	if(tsDecimalPart!="") return tsIntPart + "." + tsDecimalPart;
	else return tsIntPart;
}

function CurrencyTextBox_onfocusin(toTextBox){
	if(vbTrim(toTextBox.value)!=''&&ValidateCurrency(toTextBox.value)){
		toTextBox.value=CurrencyToNumber(toTextBox.value);
	}
}

function CurrencyTextBox_onfocusout(toTextBox){
	if(vbTrim(toTextBox.value)!=''){
		if(ValidateCurrency(toTextBox.value)){
			toTextBox.value=NumberToCurrency(CurrencyToNumber(toTextBox.value));
		}
	}
}
