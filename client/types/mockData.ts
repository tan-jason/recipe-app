import { Recipe } from './recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Tomato Basil Pasta',
    summary: 'A classic Italian pasta dish with fresh tomatoes, basil, and garlic. Simple yet flavorful.',
    ingredients: [
      '400g spaghetti pasta',
      '4 large tomatoes, diced',
      '3 cloves garlic, minced',
      '1/4 cup fresh basil leaves',
      '3 tbsp olive oil',
      'Salt and pepper to taste',
      '1/2 cup grated Parmesan cheese'
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook pasta according to package directions.',
      'Heat olive oil in a large skillet over medium heat.',
      'Add garlic and sauté for 1 minute until fragrant.',
      'Add diced tomatoes and cook for 5-7 minutes until they start to break down.',
      'Season with salt and pepper.',
      'Drain pasta and add to the tomato mixture.',
      'Toss with fresh basil and Parmesan cheese.',
      'Serve immediately with extra cheese if desired.'
    ],
    cookingTime: 25,
    servings: 4,
    difficulty: 'Easy',
    tags: ['Italian', 'Vegetarian', 'Quick']
  },
  {
    id: '2',
    title: 'Chicken Stir Fry',
    summary: 'Quick and healthy stir-fried chicken with colorful vegetables in a savory sauce.',
    ingredients: [
      '500g chicken breast, sliced thin',
      '1 bell pepper, sliced',
      '1 onion, sliced',
      '2 carrots, julienned',
      '2 tbsp soy sauce',
      '1 tbsp oyster sauce',
      '2 cloves garlic, minced',
      '1 tsp ginger, minced',
      '2 tbsp vegetable oil'
    ],
    instructions: [
      'Heat oil in a large wok or skillet over high heat.',
      'Add chicken and cook until no longer pink, about 5 minutes.',
      'Remove chicken and set aside.',
      'Add vegetables to the same pan and stir-fry for 3-4 minutes.',
      'Add garlic and ginger, cook for 30 seconds.',
      'Return chicken to pan and add sauces.',
      'Stir everything together for 1-2 minutes.',
      'Serve over rice or noodles.'
    ],
    cookingTime: 20,
    servings: 3,
    difficulty: 'Easy',
    tags: ['Asian', 'Quick', 'Healthy']
  },
  {
    id: '3',
    title: 'Mushroom Risotto',
    summary: 'Creamy Italian rice dish with mixed mushrooms and Parmesan cheese.',
    ingredients: [
      '300g Arborio rice',
      '500g mixed mushrooms, sliced',
      '1L warm chicken stock',
      '1 onion, finely chopped',
      '2 cloves garlic, minced',
      '1/2 cup white wine',
      '1/2 cup Parmesan cheese, grated',
      '3 tbsp butter',
      '2 tbsp olive oil'
    ],
    instructions: [
      'Heat olive oil in a large pan and sauté mushrooms until golden.',
      'Remove mushrooms and set aside.',
      'In the same pan, melt 1 tbsp butter and sauté onion until soft.',
      'Add garlic and rice, stirring for 1 minute.',
      'Add wine and stir until absorbed.',
      'Add stock one ladle at a time, stirring continuously.',
      'Continue until rice is creamy and tender, about 20 minutes.',
      'Stir in mushrooms, remaining butter, and Parmesan.',
      'Season and serve immediately.'
    ],
    cookingTime: 35,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Italian', 'Vegetarian', 'Comfort Food']
  },
  {
    id: '4',
    title: 'Beef Tacos',
    summary: 'Seasoned ground beef in soft tortillas with fresh toppings.',
    ingredients: [
      '500g ground beef',
      '8 soft tortillas',
      '1 onion, diced',
      '2 tsp chili powder',
      '1 tsp cumin',
      '1/2 tsp paprika',
      '1 tomato, diced',
      '1 cup lettuce, shredded',
      '1/2 cup cheese, grated',
      'Sour cream and salsa for serving'
    ],
    instructions: [
      'Brown ground beef in a large skillet over medium-high heat.',
      'Add onion and cook until soft.',
      'Add spices and cook for 1 minute.',
      'Season with salt and pepper.',
      'Warm tortillas in microwave or dry pan.',
      'Fill tortillas with beef mixture.',
      'Top with tomato, lettuce, cheese.',
      'Serve with sour cream and salsa.'
    ],
    cookingTime: 15,
    servings: 4,
    difficulty: 'Easy',
    tags: ['Mexican', 'Quick', 'Family-friendly']
  },
  {
    id: '5',
    title: 'Salmon with Lemon',
    summary: 'Pan-seared salmon fillet with a bright lemon butter sauce.',
    ingredients: [
      '4 salmon fillets (150g each)',
      '2 lemons, juiced and zested',
      '3 tbsp butter',
      '2 cloves garlic, minced',
      '2 tbsp olive oil',
      'Fresh dill for garnish',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Season salmon fillets with salt and pepper.',
      'Heat olive oil in a large skillet over medium-high heat.',
      'Cook salmon skin-side up for 4 minutes.',
      'Flip and cook for another 3-4 minutes.',
      'Remove salmon and keep warm.',
      'In the same pan, melt butter and add garlic.',
      'Add lemon juice and zest, cook for 1 minute.',
      'Pour sauce over salmon and garnish with dill.'
    ],
    cookingTime: 15,
    servings: 4,
    difficulty: 'Easy',
    tags: ['Seafood', 'Healthy', 'Quick']
  },
  {
    id: '6',
    title: 'Vegetable Curry',
    summary: 'Aromatic curry with mixed vegetables in a rich coconut milk sauce.',
    ingredients: [
      '2 potatoes, cubed',
      '1 eggplant, cubed',
      '1 bell pepper, sliced',
      '1 onion, sliced',
      '400ml coconut milk',
      '2 tbsp curry paste',
      '1 tbsp oil',
      '2 cloves garlic, minced',
      'Fresh cilantro for garnish'
    ],
    instructions: [
      'Heat oil in a large pot over medium heat.',
      'Sauté onion until translucent.',
      'Add garlic and curry paste, cook for 1 minute.',
      'Add potatoes and cook for 5 minutes.',
      'Add remaining vegetables and coconut milk.',
      'Simmer for 15-20 minutes until vegetables are tender.',
      'Season with salt to taste.',
      'Garnish with cilantro and serve with rice.'
    ],
    cookingTime: 30,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Vegetarian', 'Indian', 'Spicy']
  }
];