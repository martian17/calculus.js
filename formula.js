

class IRNode{
    type="unset";
    isBinaryAdditionLike(){
        if(!(this instanceof BinaryNode))
            return false;
        return this.opcode === "+" || this.opcode === "-";
    }
    //virtual IRNode flatten() = 0;
    flatten(){
        console.log(this);
        throw new Error("Base default flattener called. This shouldn't be happening");
    }
}
// AST nodes
class FunctionNode extends IRNode{
    type="function";
    flatten(){
        console.log(this);
        throw new Error("FunctionNode default flattener called. This shouldn't be happening");
    }
}
class BinaryNode extends FunctionNode{
    constructor(opcode,left,right){
        this.opcode = opcode;
        this.left = left;
        this.right = right;
    }
    flatten(){
        let res = new this.constructor();
        res.left = this.left.flatten();
        res.right = this.right.flatten();
        return res;
    }
}
class BinaryNode_comma extends BinaryNode{
    constructor(left,right){
        super(",",left,right);
    }
    flatten(){
        console.log(this);
        throw new Error("BinaryNode flattener called. BinaryNode should be a direct descendent of a function node. The flattening should have been delegated to UnaryNode_function.");
    }
}

// Addition Like Binary Nodes (+ or -)
const negateBinaryNodeIf = function(node,isNegated){
    if(!isNegated){
        return node;
    }
    return new BinaryNode_multiply(new NumberNode(-1),node);
};
class BinaryNode_additionLike extends BinaryNode{
    /*No direct construction*/
    flatten(){
        let terms = [];
        this.flatten_helper(terms/*accumulator*/,false/*isNegated*/);
        return new AdditionNode(terms);
    }
}
class BinaryNode_minus extends BinaryNode_additionLike{
    constructor(left,right){
        super("-",left,right);
    }
    flatten_helper(terms,isNegated){
        const {left,right} = this;
        if(left instanceof BinaryNode_additionLike){
            left.flatten_helper(terms,isNegated);
        }else{
            terms.push(negateBinaryNodeIf(left,isNegated).flatten());
        }
        if(right instanceof BinaryNode_additionLike){
            right.flatten_helper(terms,!isNegated);
        }else{
            terms.push(negateBinaryNodeIf(right,!isNegated).flatten());
        }
        //no return, just side effect
    }
}
class BinaryNode_plus extends BinaryNode_additionLike{
    constructor(left,right){
        super("+",left,right);
    }
    flatten_helper(terms,isNegated){
        const {left,right} = this;
        if(left instanceof BinaryNode_additionLike){
            left.flatten_helper(terms,isNegated);
        }else{
            terms.push(negateBinaryNodeIf(left,isNegated).flatten());
        }
        if(right instanceof BinaryNode_additionLike){
            right.flatten_helper(terms,isNegated);
        }else{
            terms.push(negateBinaryNodeIf(right,isNegated).flatten());
        }
        //no return, just side effect
    }
}

// Multiplication Like Binary Nodes
const InvertFactorIf(factor,isInverted){
    if(isInverted)return factor;
    // wip: return new BinaryNode_power(new NumberNode(-1),node);
}
class BinaryNode_multiplicationLike extends BinaryNode{
}
class BinaryNode_divide extends BinaryNode_multiplicationLike{
    constructor(left,right){
        super("/",left,right);
    }
}
class BinaryNode_multiply extends BinaryNode_multiplicationLike{
    constructor(left,right){
        super("*",left,right);
    }
}
class BinaryNode_exp extends BinaryNode_multiplicationLike{
    constructor(left,right){
        super("^",left,right);
    }
}
const opmap = new Map([
    [",",[10,+1,BinaryNode_comma]]
    ,
    ["-",[20,-1,BinaryNode_minus]],
    ["+",[20,-1,BinaryNode_plus]],
    ["/",[40,-1,BinaryNode_divide]],
    ["*",[40,-1,BinaryNode_multiply]],
    ["^",[70,+1,BinaryNode_exp]]
]);



class UnaryNode extends FunctionNode{
    constructor(opcode,value){
        this.opcode = opcode;
        this.value = value;
    }
}
class UnaryNode_function extends UnaryNode{
    flatten(){
        let right = this.value;
        let args = [];
        // Comma is left associable, thus looping only right node
        while(right instanceof BinaryNode_comma){
            args.push(right.left);
            right = right.right;
        }
        args.push(right);
        return new FunctionNode(this.opcode,[value.flatten()]);
    }
    constructor(opcode,args){
        super(o);
        this.args = args;
    }

}
class NumberNode extends IRNode{
    constructor(val){
        this.value = val;
    }
}
class VariableNode extends IRNode{
    constructor(name){
        this.name = name;
    }
}
// IR nodes
class 


class AST{} // First IR
class FunctionNode extends 
class BinaryAST extends AST{
    constructor(opcode,left,right){
        this.type = ""
    }
}
class NumberNode extends AST{
    constructor(value){
        
    }
}



const parseMath = function(str){
    str = str.trim();
    if(str.length === 0){
        throw new Error("Empty string cannot be parsed as math formula");
    }
    const operators = [];
    const operands = [];
    // Context
    let lastType = "operator";
    
    while(true){
        if(lastType === "operator"){
            // prefix or operand
            // prefix
            // Match operand or prefix
            if(str.length === 0){
                throw new Error("Unexpected end of input after operator");
            }
            const c = str[0];
            let match;
            if(match = str.match(/^[+-]?\d*\.?\d*(\d+[eE][+-]?)?\d+/)){
                match = match[0];
                //match number
                operands.push({type:"number",value:parseFloat(match)});
                str = str.slice(match.length).trimStart();
                lastType = "operand";
            }else if(match = str.match(/^[A-Za-z_][A-Za-z_0-9]*/)){
                match = match[0];
                //match identifier
                str = str.slice(match.length).trimStart();
                if(str[0] === "("){
                    operators.push({type:"function",value:match,precedence:-1});
                    str = str.slice(1).trimStart();
                    lastType = "operator";// Redundant
                }else{
                    operands.push({type:"variable",value:match});
                    lastType = "operand";
                }
            }else if(c === "-" || c === "+"){
                operators.push({type:"prefix",value:c,precedence:60});
                str = str.slice(1).trimStart();
                lastType = "operator";// Redundant
            }else if(c === "("){
                operators.push({type:"parenthesis",precedence:-1});
                str = str.slice(1).trimStart();
                lastType = "operator";// Redundant
            }else if(opmap.has(c)){
                throw new Error(`Unexpected binary operator ${c}`);
            }else{
                throw new Error(`Unexpected token ${c}`);
            }
        }else{
            // binary operator, ")", or EOF
            let precedence,associativity = 0,opcode;
            let opstr;
            if(str.length === 0){
                precedence = -1;
                opcode = "EOF";
                opstr = "EOF";
            }else{
                opstr = str[0];
                if(opstr === ")"){
                    precedence = -2;
                    str = str.slice(1).trimStart();
                    opcode = "PCLOSE";
                }else if(opmap.has(opstr)){
                    [precedence,associativity] = opmap.get(opstr);
                    str = str.slice(1).trimStart();
                    opcode = "BINARY";
                }else{
                    console.log(operators,operands,str);
                    throw new Error(`Unexpected token ${opstr} aftr operand`);
                }
            }
            // reduce
            if(operands.length === 0){
                throw new Error(`No operand in the stack on ${opstr}`);
            }
            let right = operands.pop();
            while(operators.length !== 0){
                let op = operators.pop();
                if(op.precedence < (precedence+associativity)){
                    operators.push(op);
                    break;
                }
                if(op.type === "binary"){
                    let left = operands.pop();
                    op.left = left;
                    op.right = right;
                    right = op;
                }else if(op.type === "prefix"){
                    op.right = right;
                    right = op;
                }else if(op.type === "function" || op.type === "parenthesis"){
                    if(opcode === "PCLOSE"){
                        if(op.type === "parenthesis"){
                            break;
                        }else{
                            let args = [];
                            while(right.type === "binary" && right.value === ","){
                                args.push(right.left);
                                right = right.right;
                            }
                            args.push(right);
                            op.args = args;
                            right = op;
                            break;
                        }
                    }else{
                        throw new Error("Unmatched parenthesis");
                    }
                }else{
                    throw new Error(`Unexpected operator type ${op.type}`);
                }
            }
            if(opcode === "EOF"){
                if(operands.length === 0){
                    return right;
                }else{
                    console.log(...[operands,operators,right].map(v=>JSON.stringify(v,null,2)));
                    throw new Error(`Operand stack not empty on EOF`);
                }
            }else if(opcode === "PCLOSE"){
                operands.push(right);
                lastType = "operand";
            }else{// if opcode === "BINARY"
                operands.push(right);
                operators.push({type:"binary",value:opstr,precedence});
                lastType = "operator";
            }
        }
        str = str.trimStart();
    }
};


//convert the ast to term forms
//+ -> terms
//* -> factors
//- -> -1 factor
/// -> ^-1 factor
//
//Standard form:
// terms -> factors -> exponents

const subToAdd_mut = function(ast){
    let {left,right} = ast;
    ast.opcode = "+";
    ast.right = {
        type:"function",
        opcode:"*",
        left:{type:"number",value:-1},
        right:right
    };
};

const divToMul_mut = function(ast){
    let {left,right} = ast;
    ast.opcode = "*";
    ast.right = {
        type:"function",
        opcode:"^",
        left:right,
        right:{type:"number",value:-1}
    };
};

const isAdditionLike = function(ast){
    if(ast.type !== "binary"){
        return false;
    }
    if(ast.opcode === "+" || ){
    }
}

const flattenAddition = function(ast){
    const {left,right} = ast;
    if(left.opcode === "+" || left.){
    }
}

const flattenMuldiplication = function(ast){
    if(){
    }
}




const flattenAST = function(ast){
    if(ast.type === "binary"){
        let left = cleanAST(ast.left);
        let right = cleanAST(ast.right);
        let opcode = ast.value;
        if(opcode === "+" || opcode === "-"){
            flattenAddition();
        }


        if(opcode === "-"){
            right = {
                type:"function",
                opcode:"*",
                left:{type:"number",value:-1},
                right:right
            }
            opcode = "+";
        }

    }
}

const cleanAST = function(ast){
    if(ast.type === "binary"){
        let left = cleanAST(ast.left);
        let right = cleanAST(ast.right);
        let opcode = ast.value;
        if(opcode === "-"){
            right = {type:"function",opcode:"-",value:right}
            opcode = "+";
        }
        return {type:"function",opcode,left,right};
    }else if(ast.type === "prefix"){
        return {type:"function",opcode:ast.value,value:cleanAST(ast.right)};
    }else if(ast.type === "function"){
        return {type:"function",opcode:ast.value,args:ast.args.map(cleanAST)};
    }else if(ast.type === "variable"){
        return {type:"variable",name:ast.value};
    }else if(ast.type === "number"){
        return {type:"number",value:ast.value};
    }else{
        throw new Error(`Unknown AST node type: ${ast.type}`);
    }
};






const isZero = function(ast){
    return ast.type === "number" && ast.value === 0;
};

const isNum = function(ast,n){
    return ast.type === "number" && ast.value === n;
};

const objcpy = function(obj){
    if(obj instanceof Array){
        return obj.map(v=>objcpy(v));
    }else if(typeof obj === "object"){
        const obj1 = {};
        for(let key in obj){
            obj1[key] = objcpy(obj[key]);
        }
        return obj1;
    }else{
        return obj;
    }
};



class Formula{
    static from(str){
        let f = new Formula();
        f.ast = cleanAST(parseMath(str));
        return f;
    }
};

Formula.add = function(left,right){
    left = objcpy(left);
    right = objcpy(right);
    if(isZero(left)){
        return right;
    }else if(isZero(right)){
        return left;
    }
    return {type:"function",opcode:"+",left,right};
};

Formula.negate = function(value){
    value = objcpy(value);
    if(value.type === "function" && value.opcode === "-"){
        return value.value;
    }else{
        return {
            type:"function",
            opcode:"-",
            value:value
        };
    }
};

Formula.multiply = function(left,right){
    left = objcpy(left);
    right = objcpy(right);
    if(isNum(left,1)){
        return right;
    }else if(isNum(right,1)){
        return left;
    }else if(isZero(left)){
        return left;
    }else if(isZero(right)){
        return right;
    }
    return {type:"function",opcode:"*",left,right}
};

Formula.divide = function(left,right){
    left = objcpy(left);
    right = objcpy(right);
    if(isZero(right)){
        throw new Error("Denominator zero when dividing");
    }else if(isZero(left)){
        return {type:"number",value:0};
    }else{
        return {type:"function",opcode:"/",left,right};
    }
};

Formula.power = function(left,right){
    left = objcpy(left);
    right = objcpy(right);
    if(isZero(right)){
        return {type:"number",value:1};
    }else{
        return {type:"function",opcode:"^",left,right};
    }
};


Formula.ln = function(value){
    value = objcpy(value);
    if(isNum(value,1)){
        return {type:"number",value:0};
    }else if(isNum(value,Math.E)){
        return {type:"number",value:1};
    }else{
        return {type:"function",opcode:"ln",args:[value]};
    }
};


const derivators = {
    "+":(op,varname)=>{
        return Formula.add(
            derivate(op.left,varname),
            derivate(op.right,varname)
        );
    },
    "-":(op,varname)=>{
        
        let res = derivate(op.value,varname);
    },
    "*":(op,varname)=>{
        let dl = derivate(op.left,varname);
        let dr = derivate(op.right,varname);
        let left = Formula.multiply(op.left,dr);
        let right = Formula.multiply(dl,op.right);
        return Formula.add(left,right);
    },
    "/":(op,varname)=>{
        const g = op.left;
        const h = op.right;
        const dg = derivate(g,varname);
        const dh = derivate(h,varname);
        return Formula.divide(Formula.add(Formula.multiply(dg,h),Formula.invert(Formula.multiply(dh,g))),Formula.power(h,2));
    },
    "^":(op,varname)=>{
        const f = op.left;
        const g = op.right;
        const df = derivate(f,varname);
        const dg = derivate(g,varname);
        return Formula.multiply(Formula.power(f,g),Formula.add(Formula.divide(Formula.multiply(g,df),f),Formula.multiply(dg,Formula.ln(f))));
    },
    "ln":(op,varname)=>{
        const f = op.args[0];
        const df = derivate(f,varname);
        return Formula.divide(df,f);
    }
};
const derivate = function(v,varname){
    if(v.type === "function"){
        return derivators[v.opcode](v,varname);
    }else if(v.type === "number"){
        return {type:"number",value:0};
    }else if(v.type === "variable"){
        if(v.name === varname){
            return {type:"number",value:1};
        }else{
            return {type:"variable",name:v.name};
        }
    }
}

Formula.prototype.d = function(varname){
    let f = new Formula();
    f.ast = derivate(this.ast,varname);
    return f;
};




//console.log(JSON.stringify(parseMath("3+sin(5*2+3*3+4,1,1)"),null,2));
//console.log(JSON.stringify(parseMath("a*x^3+b*x^2+c*x+d"),null,2));
console.log(JSON.stringify(Formula.from("ln(x^2)").d("x"),null,2));


