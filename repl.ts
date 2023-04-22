type Symbols = string;
type Figure = number; 
type List = Exp[];
type Exp = Atom | List | ((args:List) => Exp);
type Atom = Symbols | Figure;
interface Err {
    message: string;
}
interface Env {
    [key:Symbols]: Exp,
};

function tokenize(chars:string):string[]{
    // "Convert a string of characters into a list of tokens."
    return chars.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ").filter((c) => c !== "");
}

function parse(program:string):Exp {
    return read_from_tokens(tokenize(program));
}

function read_from_tokens(tokens: string[]):Exp {
    // if (tokens.length === 0) throw new Error('unexpected EOF');
    const token = tokens.shift();
    if (token === '(') {
        const l:List = [];
        while (tokens[0] !== ")") {
            l.push(read_from_tokens(tokens));
        }
        tokens.shift();
        return l;
    } else if (token === ')'){
        throw new Error("unexpected ')'");
    } else {
        if (typeof(token) !== "string") throw new Error('token is undefined');
        return atom(token);
    };
}

function atom(token:Symbols): Atom {
    const new_atom:Figure = Number(token);
    if (isNaN(new_atom)) {
        return token;
    } else {
        return new_atom;
    };
}

function standard_env(): Env {
    const env:Env = {
        '+': (args:List):Exp => {
                return parse_list_of_numbers(args).reduce((a, b) => a + b);  
            },
        '-': (args:List):Exp => {
                let nums:Figure[] = parse_list_of_numbers(args);
                let first = nums.shift();
                
                if (typeof(first) !== 'number') throw new Error('expected a first element in list to be number');

                let sum_rest = nums.reduce((a, b) => a + b);
                return Number(first - sum_rest);
            }
    };
    return env;
}

function parse_list_of_numbers(args:List):Figure[] {
    return args.map((arg) => parse_single_number(arg));
}

function parse_single_number(exp: Exp):Figure {
    const new_num:Figure = Number(exp);
    if (isNaN(new_num)) throw new Error('expected a number');
    
    return new_num;
}


function evaluate(x:Exp, env:Env=global_env):Exp {
    if(typeof(x) === 'string'){
        if (typeof(env[x]) === 'undefined') throw new Error('unexpected symbol');
        return env[x];
    } else if (typeof(x) === 'number'){
        return x; 
    } else if (typeof(x) === 'function'){ 
        throw new Error("unexpected form");
    } else if (Array.isArray(x)){
        let first_form = x.shift();
        if (typeof(first_form) === 'undefined') throw new Error('expected non-empty list');
        let arg_forms = x;
        let first_eval = evaluate(first_form);

        if (typeof(first_eval) === 'function') {
            let args_eval:List = arg_forms.map((x) => evaluate(x));
            return first_eval(args_eval);
        } else {
            throw new Error('first form must be a function');
        }
    } else {
        throw new Error("unexpected form");
    } 
}


function repl() {
    // example of a valid input: "(+ 10 5 (- 10 3 3))"
    const prompt_text = 'tisp> ';
    while(true) {
        const program = prompt(prompt_text);
        if (typeof(program) === 'string') {
            const parsed_program:List = Object.values(parse(program));
            console.log(evaluate(parsed_program));    
        }
        else {
            throw new Error('program entered is null');
        }
    }
}

const global_env:Env = standard_env();
repl();