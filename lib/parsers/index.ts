import type { Language, LanguageConfig, ParseResult } from "../types";
import { parsePython } from "./python";
import { parseJava } from "./java";
import { parseTypeScript } from "./typescript";

export const LANGUAGES: Record<Language, LanguageConfig> = {
  python: {
    id: "python",
    label: "Python",
    monacoLang: "python",
    filename: "main.py",
    sample: `class Animal:
    def __init__(self, name):
        self.name = name
        self.age = 0

    def make_sound(self):
        pass

    def get_name(self):
        return self.name


class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
        self.toys = []

    def make_sound(self):
        return "Woof!"

    def fetch(self, item):
        return f"{self.name} fetched {item}"


class Cat(Animal):
    def __init__(self, name, color):
        super().__init__(name)
        self.color = color
        self.lives = 9

    def make_sound(self):
        return "Meow!"


class PetOwner:
    def __init__(self, name):
        self.name = name
        self.pets = []

    def add_pet(self, pet):
        self.pets.append(pet)
`,
  },
  java: {
    id: "java",
    label: "Java",
    monacoLang: "java",
    filename: "Main.java",
    sample: `public abstract class Animal {
    protected String name;
    protected int age;

    public Animal(String name) {
        this.name = name;
        this.age = 0;
    }

    public abstract String makeSound();

    public String getName() {
        return this.name;
    }
}

public class Dog extends Animal {
    private String breed;
    private List<String> toys;

    public Dog(String name, String breed) {
        super(name);
        this.breed = breed;
        this.toys = new ArrayList<>();
    }

    @Override
    public String makeSound() {
        return "Woof!";
    }

    public String fetch(String item) {
        return name + " fetched " + item;
    }
}

public class Cat extends Animal {
    private String color;
    private int lives;

    public Cat(String name, String color) {
        super(name);
        this.color = color;
        this.lives = 9;
    }

    @Override
    public String makeSound() {
        return "Meow!";
    }
}

public class PetOwner {
    private String name;
    private List<Animal> pets;

    public PetOwner(String name) {
        this.name = name;
        this.pets = new ArrayList<>();
    }

    public void addPet(Animal pet) {
        this.pets.add(pet);
    }
}
`,
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    monacoLang: "typescript",
    filename: "main.ts",
    sample: `abstract class Animal {
  protected name: string;
  protected age: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  abstract makeSound(): string;

  getName(): string {
    return this.name;
  }
}

class Dog extends Animal {
  private breed: string;
  toys: string[] = [];

  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }

  makeSound(): string {
    return "Woof!";
  }

  fetch(item: string): string {
    return \`\${this.name} fetched \${item}\`;
  }
}

class Cat extends Animal {
  private color: string;
  lives: number = 9;

  constructor(name: string, color: string) {
    super(name);
    this.color = color;
  }

  makeSound(): string {
    return "Meow!";
  }
}

class PetOwner {
  pets: Animal[] = [];

  constructor(public name: string) {}

  addPet(pet: Animal): void {
    this.pets.push(pet);
  }
}
`,
  },
};

export function parse(code: string, language: Language): ParseResult {
  switch (language) {
    case "python":
      return parsePython(code);
    case "java":
      return parseJava(code);
    case "typescript":
      return parseTypeScript(code);
  }
}

export type { Language, LanguageConfig };
