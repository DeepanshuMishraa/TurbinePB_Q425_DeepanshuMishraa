use rand::Rng;
use std::io;

fn main() {
    println!("Hey, Welcome to the Rust Guessing Game! Enter q to quit");

    loop {
        let secret_number = rand::thread_rng().gen_range(1..=100);
        println!("Guess the number between 1 and 100: ");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess = guess.trim();

        if guess == "q" || guess == "Q" {
            println!("Thanks for playing!");
            break;
        }

        println!("You guessed: {}", guess);

        if guess.trim().parse::<u32>().unwrap() == secret_number {
            println!("You win!");
            break;
        } else {
            match guess.trim().parse::<u32>().unwrap().cmp(&secret_number) {
                std::cmp::Ordering::Less => println!("Too small!"),
                std::cmp::Ordering::Greater => println!("Too big!"),
                std::cmp::Ordering::Equal => println!("You win!"),
            }
        }
    }
}
