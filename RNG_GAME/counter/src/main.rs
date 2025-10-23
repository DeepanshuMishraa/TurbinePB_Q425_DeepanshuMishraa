use std::io;

enum Operations {
    Increment,
    Decrement,
}

fn main() {
    println!("Welcome to 10 incrementer or decrementer");
    let mut counter = 0;
    println!("Counter is starting at {}", counter);

    loop {
        let mut input = String::new();

        println!("Do you want to increment or decrement?  + to incremenet and - Decrement");

        io::stdin()
            .read_line(&mut input)
            .expect("Failed to parse the sign");

        if input.trim().eq_ignore_ascii_case("quit") {
            println!("Okay then goodbye");
            break;
        }

        let ops = match input.trim() {
            "+" => Operations::Increment,
            "-" => Operations::Decrement,
            _ => panic!("Operation not supported yet!"),
        };

        match ops {
            Operations::Increment => counter += 10,
            Operations::Decrement => counter -= 10,
        }

        println!("Finally counter is at {}", counter);
    }
}
