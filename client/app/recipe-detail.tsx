import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/types/recipe';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

// Placeholder recipe for hook initialization when recipe is not yet available
const placeholderRecipe: Recipe = {
  id: '',
  title: '',
  summary: '',
  ingredients: [],
  instructions: [],
  cookingTime: 0,
  servings: 0,
  difficulty: 'Easy',
  tags: [],
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id, recipeData } = useLocalSearchParams<{ id: string; recipeData?: string }>();

  let recipe: Recipe | undefined;

  // First try to get recipe from passed data
  if (recipeData) {
    try {
      recipe = JSON.parse(recipeData);
    } catch (error) {
      console.error('Error parsing recipe data:', error);
    }
  }

  // Voice assistant hook - must be called unconditionally
  const { state: voiceState, isActive: voiceActive, toggle: toggleVoice } = useVoiceAssistant(
    recipe || placeholderRecipe
  );

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.summary}>{recipe.summary}</Text>

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.metaText}>{recipe.cookingTime} minutes</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.metaText}>Serves {recipe.servings}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(recipe.difficulty) }
                ]}
              >
                {recipe.difficulty}
              </Text>
            </View>
          </View>

          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.bullet}>—</Text>
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.stepNumberText}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {recipe && (
        <VoiceAssistant
          state={voiceState}
          isActive={voiceActive}
          onToggle={toggleVoice}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  summary: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metaItem: {
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  difficultyBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    color: '#71717a',
    marginTop: 1,
    marginRight: 15,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#9ca3af',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginTop: 100,
  },
});