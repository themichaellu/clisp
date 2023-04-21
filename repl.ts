type Sequence = string;
type Figure = number; 
type List = Exp[];
type Atom = Sequence | Figure;
type Exp = Atom | List | Function;
type Env = object;

function tokenize(chars:string):Array<string> {
    // "Convert a string of characters into a list of tokens."
    return chars.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ").filter((c) => c !== "");
}

function parse(program: string): Exp {
    return read_from_tokens(tokenize(program))
}

function read_from_tokens(tokens: string[]): Exp {
    if (tokens.length === 0) throw new Error('unexpected EOF');

    let token = tokens.shift();

    if (token === '(') {
        let l:any[] = [];

        while ( tokens[0] !== ")" ) {
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

function atom(token:string): Atom {
    const new_atom = Number(token);

    if (isNaN(new_atom)) {
        return token;
    }
    else {
        return new_atom;
    };
}

function standard_env(): Env {
    const env:Env = {
        '+': function(args:Exp[]):Exp {
                return parse_list_of_numbers(args).reduce((a, b) => a + b);  
            },
        '-': function(args:Exp[]):Exp {
                let nums:Figure[] = parse_list_of_numbers(args);
                let first = nums.shift();
                
                if (typeof(first) !== 'number') throw new Error('expected a first element in list to be number');

                let sum_rest = nums.reduce((a, b) => a + b);
                return Number(first - sum_rest);
        }
    };

    return env;
}

function parse_list_of_numbers(args:Exp[]):Figure[] {
    return args.map((arg) => parse_single_number(arg));
}

function parse_single_number(exp: Exp):Figure {
    const new_num = Number(exp);

    if (isNaN(new_num)) throw new Error('expected a number');
    
    return new_num;
}


function evaluate(x:Exp|undefined, env:Env=global_env):Exp {
    if(typeof(x) === 'undefined') {
        throw new Error("exp is undefined");
    } else if(typeof(x) === 'string'){
        if (typeof(env[x]) === 'undefined') throw new Error('unexpected symbol');
        return env[x];
    } else if (typeof(x) === 'number'){
        return x; 
    } else if (typeof(x) === 'function'){ 
        throw new Error("unexpected form");
    } else if (x.every((exp) => typeof(exp) !== 'undefined')){
        let first_form = x.shift();
        if (typeof(first_form) === 'undefined') throw new Error('expected non-empty list');
        let arg_forms = x;
        let first_eval = evaluate(first_form);

        if (typeof(first_eval) === 'function') {
            let args_eval:Exp[] = arg_forms.map((x) => evaluate(x));
            return first_eval(args_eval);
        } else {
            throw new Error('first form must be a function');
        }
    } else {
        throw new Error("unexpected form");
    } 
}


function main() {
    // const program:string = "(begin (define r 10) (* pi (* r r)))";
    const program:string = "(+ 10 5 (- 10 3 3))";
    const parsed_program:Exp[] = Object.values(parse(program));
    console.log(evaluate(parsed_program));
}

const global_env:Env = standard_env();

main();