class Animal:
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
    
    def add_toy(self, toy):
        self.toys.append(toy)


class Cat(Animal):
    def __init__(self, name, color):
        super().__init__(name)
        self.color = color
        self.lives = 9
    
    def make_sound(self):
        return "Meow!"
    
    def scratch(self):
        return f"{self.name} scratches!"


class PetOwner:
    def __init__(self, name):
        self.name = name
        self.pets = []
    
    def add_pet(self, pet):
        self.pets.append(pet)
    
    def list_pets(self):
        return [pet.name for pet in self.pets]