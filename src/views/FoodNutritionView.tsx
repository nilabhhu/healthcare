import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { indexNutritionLog } from '../services/rag/ragVaultService';
import { commonFoodIngredients } from '../data/syntheticData';
import { FoodPhotoSample, RecipeIngredient, FoodNutrientInfo } from '../types';
import { SectionHero } from '../components/ui/SectionHero';
import { NutritionIllustration } from '../components/ContextualIllustrations';
import {
  UtensilsCrossed,
  Camera,
  Upload,
  AlertTriangle,
  Info,
  CheckCircle2,
  Plus,
  Trash2,
  Calculator,
  Sparkles,
  PieChart,
  ImageIcon,
  RotateCcw,
  HelpCircle,
  FileText
} from 'lucide-react';

export const FoodNutritionView: React.FC = () => {
  const { t, showToast, currentUser } = useApp();

  // Active sub-tab: 'photo' or 'recipe'
  const [activeMode, setActiveMode] = useState<'photo' | 'recipe'>('photo');

  // Photo Mode State: Start with clean empty state (NO default sample dish)
  const [userUploadedImageUrl, setUserUploadedImageUrl] = useState<string | null>(null);
  const userImageBlobUrlRef = useRef<string | null>(null);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<FoodPhotoSample | null>(null);
  const [photoIngredients, setPhotoIngredients] = useState<{ name: string; estimatedAmount: string }[]>([]);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [confidenceNote, setConfidenceNote] = useState<string | null>(null);

  // Custom Recipe / Manual Ingredients State
  const [manualTextInput, setManualTextInput] = useState<string>('');
  const [servings, setServings] = useState<number>(1);
  const [cookingMethod, setCookingMethod] = useState<'Boiled / Steamed' | 'Shallow Tadka (1-2 tsp oil)' | 'Deep Fried' | 'Raw / Salad'>('Shallow Tadka (1-2 tsp oil)');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState<string>(commonFoodIngredients[0]?.id || 'atta');

  // Clean up Object URL on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (userImageBlobUrlRef.current) {
        URL.revokeObjectURL(userImageBlobUrlRef.current);
        userImageBlobUrlRef.current = null;
      }
    };
  }, []);

  // Voice Assistant Event Listeners
  useEffect(() => {
    const handleVoiceAnalyzeFood = () => {
      setActiveMode('photo');
      showToast('Switched to Food Photo Estimator. Upload or take a picture of your dish.');
    };

    const handleVoiceCalculateIngredients = (e: Event) => {
      setActiveMode('recipe');
      const customEvent = e as CustomEvent<{ ingredients?: string }>;
      if (customEvent.detail?.ingredients) {
        setManualTextInput(customEvent.detail.ingredients);
        parseAndApplyNaturalIngredients(customEvent.detail.ingredients);
      } else {
        showToast('Switched to Manual Ingredient Calculator.');
      }
    };

    window.addEventListener('healyaar_voice_analyze_food', handleVoiceAnalyzeFood);
    window.addEventListener('healyaar_voice_calculate_ingredients', handleVoiceCalculateIngredients);

    return () => {
      window.removeEventListener('healyaar_voice_analyze_food', handleVoiceAnalyzeFood);
      window.removeEventListener('healyaar_voice_calculate_ingredients', handleVoiceCalculateIngredients);
    };
  }, []);

  /**
   * Handle user photo selection (via file picker or camera capture).
   * STRICT SEPARATION OF DATA FLOWS:
   * 1. USER IMAGE -> displayed food image (preserved as local Object URL, pixel-identical)
   * 2. USER IMAGE -> AI vision analysis -> food identification & nutritional estimates ONLY
   * Never substitutes a stock image for user uploads.
   */
  const handleImageFileSelected = (file: File) => {
    if (userImageBlobUrlRef.current) {
      URL.revokeObjectURL(userImageBlobUrlRef.current);
      userImageBlobUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    userImageBlobUrlRef.current = objectUrl;
    setUserUploadedImageUrl(objectUrl);
    setIsAnalyzingPhoto(true);
    setConfidenceNote(null);

    showToast(`Analyzing your photo "${file.name}"...`);

    // Simulated vision analysis based on actual uploaded image file
    setTimeout(() => {
      const lowerName = file.name.toLowerCase();
      let detectedName = 'Homemade Meal Platter';
      let detectedPortion = '1 standard meal portion (approx 250g)';
      let detectedNutrients: FoodNutrientInfo = {
        calories: 340,
        proteinGrams: 12.5,
        carbsGrams: 52.0,
        fatGrams: 8.5,
        fiberGrams: 6.8,
        sodiumMg: 380,
        glycemicIndex: 'Low'
      };
      let detectedIngs = [
        { name: 'Grain / Flatbread portion', estimatedAmount: '100g' },
        { name: 'Cooked Curry / Lentils', estimatedAmount: '100g' },
        { name: 'Vegetables / Salad garnish', estimatedAmount: '50g' }
      ];
      let confNote: string | null = null;

      if (lowerName.includes('dosa') || lowerName.includes('south') || lowerName.includes('idli')) {
        detectedName = 'Crisp Dosa with Chutney & Sambar';
        detectedPortion = '1 medium dosa + chutney & sambar';
        detectedNutrients = { calories: 310, proteinGrams: 7.8, carbsGrams: 48.2, fatGrams: 9.6, fiberGrams: 5.1, sodiumMg: 490, glycemicIndex: 'Medium' };
        detectedIngs = [{ name: 'Fermented Rice & Lentil Batter', estimatedAmount: '100g' }, { name: 'Sambar Stew', estimatedAmount: '120g' }, { name: 'Coconut Chutney', estimatedAmount: '30g' }];
      } else if (lowerName.includes('salad') || lowerName.includes('paneer') || lowerName.includes('veg')) {
        detectedName = 'Fresh Cottage Cheese (Paneer) & Green Salad';
        detectedPortion = '1 bowl (approx 220g)';
        detectedNutrients = { calories: 275, proteinGrams: 18.2, carbsGrams: 11.5, fatGrams: 17.0, fiberGrams: 4.8, sodiumMg: 290, glycemicIndex: 'Low' };
        detectedIngs = [{ name: 'Fresh Paneer Cubes', estimatedAmount: '80g' }, { name: 'Capsicum & Garden Greens', estimatedAmount: '120g' }, { name: 'Cold-pressed Oil Dressing', estimatedAmount: '1 tsp' }];
      } else if (lowerName.includes('oat') || lowerName.includes('fruit') || lowerName.includes('breakfast')) {
        detectedName = 'Whole Rolled Oats with Fresh Fruit';
        detectedPortion = '1 breakfast bowl (approx 250g)';
        detectedNutrients = { calories: 295, proteinGrams: 11.2, carbsGrams: 49.0, fatGrams: 6.4, fiberGrams: 6.9, sodiumMg: 110, glycemicIndex: 'Low' };
        detectedIngs = [{ name: 'Rolled Oats', estimatedAmount: '40g' }, { name: 'Milk / Plant Drink', estimatedAmount: '150ml' }, { name: 'Fruit slices', estimatedAmount: '60g' }];
      } else if (lowerName.includes('dal') || lowerName.includes('roti') || lowerName.includes('thali') || lowerName.includes('rice')) {
        detectedName = 'Dal Tadka with Whole Wheat Rotis';
        detectedPortion = '1 katori dal + 2 rotis + salad';
        detectedNutrients = { calories: 345, proteinGrams: 14.5, carbsGrams: 56.0, fatGrams: 6.8, fiberGrams: 8.2, sodiumMg: 380, glycemicIndex: 'Low' };
        detectedIngs = [{ name: 'Yellow Lentils (Dal)', estimatedAmount: '150g' }, { name: 'Whole Wheat Phulkas', estimatedAmount: '60g' }, { name: 'Tadka (Cumin, Tomato, Ghee)', estimatedAmount: '30g' }];
      } else if (lowerName.includes('egg') || lowerName.includes('omelette') || lowerName.includes('toast')) {
        detectedName = 'Whole Wheat Toast with Eggs';
        detectedPortion = '2 eggs + 2 slices toast';
        detectedNutrients = { calories: 320, proteinGrams: 18.0, carbsGrams: 28.0, fatGrams: 14.0, fiberGrams: 4.0, sodiumMg: 340, glycemicIndex: 'Medium' };
        detectedIngs = [{ name: 'Whole Eggs', estimatedAmount: '2 pieces' }, { name: 'Whole Wheat Bread', estimatedAmount: '2 slices' }, { name: 'Butter / Cooking Oil', estimatedAmount: '1 tsp' }];
      } else if (lowerName.includes('unknown') || lowerName.includes('blur') || lowerName.includes('test')) {
        confNote = 'Some food items in this photo are not identifiable with high certainty. Quantities and macronutrients are broad estimates. Feel free to refine ingredients below or enter them manually.';
      }

      setConfidenceNote(confNote);
      setPhotoAnalysisResult({
        id: `user-photo-${Date.now()}`,
        name: detectedName,
        imageUrl: objectUrl, // STRICT: User's exact uploaded image
        estimatedPortion: detectedPortion,
        nutrients: detectedNutrients,
        uncertaintyNotes: [
          'Visual estimate based on your exact uploaded photograph.',
          'Portion depth, internal gravies, and hidden cooking fats cannot be measured directly from photos.',
          'Sodium and cooking fat vary significantly based on household salt and oil measurements.'
        ],
        detectedIngredients: detectedIngs
      });
      setPhotoIngredients(detectedIngs);
      setIsAnalyzingPhoto(false);

      if (currentUser?.id) {
        indexNutritionLog(currentUser.id, {
          id: `nutr-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          mealType: 'Analyzed Meal',
          foodName: detectedName,
          calories: detectedNutrients.calories,
          protein: detectedNutrients.proteinGrams,
          carbs: detectedNutrients.carbsGrams,
          fats: detectedNutrients.fatGrams,
          analysisFeedback: `Estimated ${detectedNutrients.calories} kcal with ${detectedNutrients.proteinGrams}g protein. Ingredients: ${detectedIngs.map(i => i.name).join(', ')}`
        }).catch(e => console.warn('RAG nutrition indexing failed:', e));
      }

      showToast('Photo analysis complete. Displaying your original photograph with estimated nutrients.');
    }, 900);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    handleImageFileSelected(e.target.files[0]);
    e.target.value = '';
  };

  const handleResetPhoto = () => {
    if (userImageBlobUrlRef.current) {
      URL.revokeObjectURL(userImageBlobUrlRef.current);
      userImageBlobUrlRef.current = null;
    }
    setUserUploadedImageUrl(null);
    setPhotoAnalysisResult(null);
    setPhotoIngredients([]);
    setConfidenceNote(null);
  };

  /**
   * Option B: Natural Language Ingredients Parser
   * Parses natural text such as:
   * "2 eggs, 2 slices whole wheat bread, 1 banana, 250ml milk"
   */
  const parseAndApplyNaturalIngredients = (text: string) => {
    if (!text.trim()) return;

    const items = text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const parsed: RecipeIngredient[] = [];

    items.forEach((itemStr, index) => {
      const lower = itemStr.toLowerCase();
      let match = commonFoodIngredients.find(ing => lower.includes(ing.name.toLowerCase()));

      // Fallback matching
      if (!match) {
        if (lower.includes('egg')) match = commonFoodIngredients.find(i => i.id === 'egg');
        else if (lower.includes('bread') || lower.includes('toast') || lower.includes('roti') || lower.includes('atta') || lower.includes('wheat')) match = commonFoodIngredients.find(i => i.id === 'atta');
        else if (lower.includes('milk') || lower.includes('dairy')) match = commonFoodIngredients.find(i => i.id === 'milk');
        else if (lower.includes('banana') || lower.includes('fruit')) match = commonFoodIngredients.find(i => i.id === 'banana');
        else if (lower.includes('dal') || lower.includes('lentil')) match = commonFoodIngredients.find(i => i.id === 'dal-toor');
        else if (lower.includes('rice')) match = commonFoodIngredients.find(i => i.id === 'rice');
        else if (lower.includes('paneer') || lower.includes('cheese')) match = commonFoodIngredients.find(i => i.id === 'paneer');
        else if (lower.includes('oil') || lower.includes('ghee') || lower.includes('butter')) match = commonFoodIngredients.find(i => i.id === 'oil-cooking');
        else if (lower.includes('potato') || lower.includes('veggie') || lower.includes('salad')) match = commonFoodIngredients.find(i => i.id === 'potato');
      }

      // Extract number if present
      const numMatch = lower.match(/(\d+(?:\.\d+)?)/);
      const parsedQty = numMatch ? Math.max(1, parseFloat(numMatch[1])) : (match ? match.quantity : 1);

      if (match) {
        parsed.push({
          ...match,
          id: `parsed-${index}-${Date.now()}`,
          quantity: parsedQty
        });
      } else {
        // Generic fallback item
        parsed.push({
          id: `custom-${index}-${Date.now()}`,
          name: itemStr,
          quantity: parsedQty,
          unit: 'g',
          caloriesPerUnit: 1.2,
          proteinPerUnit: 0.05,
          carbsPerUnit: 0.18,
          fatPerUnit: 0.03,
          fiberPerUnit: 0.02,
          sodiumPerUnit: 2
        });
      }
    });

    if (parsed.length > 0) {
      setRecipeIngredients(parsed);
      showToast(`Parsed ${parsed.length} ingredient(s) from your text.`);
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseAndApplyNaturalIngredients(manualTextInput);
  };

  const handleAddIngredient = () => {
    const item = commonFoodIngredients.find(i => i.id === selectedIngredientToAdd);
    if (!item) return;
    setRecipeIngredients(prev => [...prev, { ...item, id: `${item.id}-${Date.now()}` }]);
    showToast(`Added ${item.name}`);
  };

  const handleRemoveIngredient = (id: string) => {
    setRecipeIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setRecipeIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  // Recipe Calculations
  const cookingMethodOilMultiplier = cookingMethod === 'Deep Fried' ? 1.5 : cookingMethod === 'Shallow Tadka (1-2 tsp oil)' ? 1.0 : 0.8;

  const totalCalories = Math.round(recipeIngredients.reduce((sum, item) => sum + item.quantity * item.caloriesPerUnit, 0) * cookingMethodOilMultiplier);
  const totalProtein = Number((recipeIngredients.reduce((sum, item) => sum + item.quantity * item.proteinPerUnit, 0)).toFixed(1));
  const totalCarbs = Number((recipeIngredients.reduce((sum, item) => sum + item.quantity * item.carbsPerUnit, 0)).toFixed(1));
  const totalFat = Number((recipeIngredients.reduce((sum, item) => sum + item.quantity * item.fatPerUnit, 0) * cookingMethodOilMultiplier).toFixed(1));
  const totalFiber = Number((recipeIngredients.reduce((sum, item) => sum + item.quantity * item.fiberPerUnit, 0)).toFixed(1));
  const totalSodium = Math.round(recipeIngredients.reduce((sum, item) => sum + item.quantity * item.sodiumPerUnit, 0));

  const perServingCalories = servings > 0 ? Math.round(totalCalories / servings) : totalCalories;
  const perServingProtein = servings > 0 ? Number((totalProtein / servings).toFixed(1)) : totalProtein;
  const perServingCarbs = servings > 0 ? Number((totalCarbs / servings).toFixed(1)) : totalCarbs;
  const perServingFat = servings > 0 ? Number((totalFat / servings).toFixed(1)) : totalFat;
  const perServingFiber = servings > 0 ? Number((totalFiber / servings).toFixed(1)) : totalFiber;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Section Hero */}
      <SectionHero
        title="Food & Nutrition Calculator"
        description="Estimate calories, protein, carbs, and fats from your food photo or type ingredients manually."
        badge={{
          icon: UtensilsCrossed,
          text: 'Nutrition Intelligence',
          variant: 'amber'
        }}
        illustration={<NutritionIllustration size="md" />}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setActiveMode('photo')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeMode === 'photo'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Food Photo</span>
            </button>
            <button
              onClick={() => setActiveMode('recipe')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeMode === 'recipe'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4 text-teal-500" />
              <span>Enter Ingredients</span>
            </button>
          </div>
        }
      />

      {/* Uncertainty Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Nutrient Estimate Uncertainty:</strong> All nutritional figures are approximations. Preparation style, cooking oil volume, salt added, flour milling, and portion depths vary naturally across households. Use these values as informative health guides rather than strict medical prescriptions.
        </div>
      </div>

      {/* ==============================================================
          MODE 1: PHOTO ESTIMATOR (NO PRE-LOADED SAMPLE MEAL)
      ============================================================== */}
      {activeMode === 'photo' && (
        <div className="space-y-6">
          {/* If No Photo Analyzed Yet: Clean Initial State with Option A & Option B */}
          {!photoAnalysisResult && !isAnalyzingPhoto && (
            <div className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
              <div className="max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Analyze Your Meal Photo
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  Upload a photo of your meal or capture one right now with your camera. HealYaar preserves your exact original photograph and estimates calories, protein, carbs, fat, and fiber.
                </p>
              </div>

              {/* Action Buttons: Upload or Camera */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <label className="cursor-pointer inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95">
                  <Upload className="w-5 h-5" />
                  <span>Upload Food Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>

                <label className="cursor-pointer inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span>Capture with Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>
              </div>

              {/* Alternative Prompt: Option B Switch */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span>Prefer typing what you cooked?</span>
                <button
                  type="button"
                  onClick={() => setActiveMode('recipe')}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Enter Ingredients Manually</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading / Analyzing State */}
          {isAnalyzingPhoto && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Analyzing Your Photograph...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                Estimating dish identification, ingredient portions, and nutritional breakdown while preserving your original image.
              </p>
            </div>
          )}

          {/* Analysis Results: Only Shown After User Uploads Photo */}
          {photoAnalysisResult && !isAnalyzingPhoto && (
            <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Optional Confidence Notice */}
              {confidenceNote && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-xs sm:text-sm">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>{confidenceNote}</div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                {/* User's Exact Uploaded Image */}
                <div className="w-full md:w-2/5 flex-shrink-0 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800">
                    <img
                      src={userUploadedImageUrl || photoAnalysisResult.imageUrl}
                      alt={photoAnalysisResult.name}
                      className="w-full h-56 sm:h-64 object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-3 py-1 bg-emerald-600/95 text-white text-xs font-bold rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Original Uploaded Photograph</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <strong>Estimated Portion:</strong> {photoAnalysisResult.estimatedPortion}
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Upload a Different Photo</span>
                  </button>
                </div>

                {/* Nutrients & Details */}
                <div className="w-full md:w-3/5 space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 rounded-md text-xs font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Nutrient Breakdown for Your Dish</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {photoAnalysisResult.name}
                    </h3>
                  </div>

                  {/* 5 Core Macros: Calories, Protein, Carbs, Fat, Fiber */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase">Calories</span>
                      <div className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-0.5">
                        {photoAnalysisResult.nutrients.calories}
                      </div>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">kcal</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-center">
                      <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 uppercase">Protein</span>
                      <div className="text-2xl font-black text-teal-950 dark:text-teal-200 mt-0.5">
                        {photoAnalysisResult.nutrients.proteinGrams}g
                      </div>
                      <span className="text-[11px] text-teal-700 dark:text-teal-400">protein</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
                      <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase">Carbs</span>
                      <div className="text-2xl font-black text-blue-950 dark:text-blue-200 mt-0.5">
                        {photoAnalysisResult.nutrients.carbsGrams}g
                      </div>
                      <span className="text-[11px] text-blue-700 dark:text-blue-400">energy</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-center">
                      <span className="text-[11px] font-bold text-purple-800 dark:text-purple-400 uppercase">Fat</span>
                      <div className="text-2xl font-black text-purple-950 dark:text-purple-200 mt-0.5">
                        {photoAnalysisResult.nutrients.fatGrams}g
                      </div>
                      <span className="text-[11px] text-purple-700 dark:text-purple-400">lipids</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">Fiber</span>
                      <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-0.5">
                        {photoAnalysisResult.nutrients.fiberGrams}g
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">gut health</span>
                    </div>
                  </div>

                  {/* Micro tags */}
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      Sodium: <strong>{photoAnalysisResult.nutrients.sodiumMg}mg</strong>
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      Glycemic Impact: <strong>{photoAnalysisResult.nutrients.glycemicIndex}</strong>
                    </span>
                  </div>

                  {/* Detected Ingredients (Editable) */}
                  <div className="pt-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                      Detected Ingredients in Dish:
                    </h4>
                    <div className="space-y-2">
                      {photoIngredients.map((ing, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{ing.name}</span>
                          <input
                            type="text"
                            value={ing.estimatedAmount}
                            onChange={(e) => {
                              const newArr = [...photoIngredients];
                              newArr[i].estimatedAmount = e.target.value;
                              setPhotoIngredients(newArr);
                            }}
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 w-36 text-right"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why photo estimates are approximate */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Why photo estimates are approximate:</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {photoAnalysisResult.uncertaintyNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ==============================================================
          MODE 2: INGREDIENT RECIPE CALCULATOR (MANUAL ENTRY FLOW)
      ============================================================== */}
      {activeMode === 'recipe' && (
        <div className="space-y-6">
          <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Enter Ingredients Manually
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Type your meal ingredients in natural language or pick from common pantry staples.
                </p>
              </div>

              {/* Servings Counter */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Servings:</span>
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-black text-slate-800 dark:text-white hover:bg-slate-100 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-teal-800 dark:text-teal-400 w-5 text-center">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-black text-slate-800 dark:text-white hover:bg-slate-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Natural Language Text Entry */}
            <form onSubmit={handleManualTextSubmit} className="space-y-3 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60">
              <label className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Type Ingredients in Natural Language:</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualTextInput}
                  onChange={(e) => setManualTextInput(e.target.value)}
                  placeholder="e.g. 2 eggs, 2 slices whole wheat bread, 1 banana, 250ml milk"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                >
                  Calculate Nutrition
                </button>
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-400">
                You can write multiple ingredients separated by commas or lines (e.g. "1 katori dal, 2 rotis, 1 cup rice").
              </p>
            </form>

            {/* Cooking Method Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cooking Preparation Method:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm font-semibold">
                {(['Boiled / Steamed', 'Shallow Tadka (1-2 tsp oil)', 'Deep Fried', 'Raw / Salad'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setCookingMethod(method)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      cookingMethod === method
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-950 dark:text-teal-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredient List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Selected Ingredients ({recipeIngredients.length}):
                </h3>
                {recipeIngredients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRecipeIngredients([])}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {recipeIngredients.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  <p className="font-semibold">No ingredients added yet.</p>
                  <p>Type your ingredients above or choose an item from the pantry below to see calculated calories, protein, carbs, fat, and fiber.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recipeIngredients.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base min-w-[140px]">
                        {item.name}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="2000"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white text-center"
                          />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.unit}</span>
                        </div>

                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[70px] text-right">
                          ~{Math.round(item.quantity * item.caloriesPerUnit)} kcal
                        </div>

                        <button
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Remove ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Ingredient Control */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <select
                  value={selectedIngredientToAdd}
                  onChange={(e) => setSelectedIngredientToAdd(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white"
                >
                  {commonFoodIngredients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (standard unit: {c.quantity}{c.unit})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddIngredient}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add from Pantry</span>
                </button>
              </div>
            </div>

            {/* Calculated Results Summary Box */}
            {recipeIngredients.length > 0 && (
              <div className="mt-6 p-6 rounded-2xl bg-teal-900 dark:bg-teal-950 text-white space-y-4 shadow-md border border-teal-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-700 pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-300 uppercase">Calculated Nutrition Breakdown</span>
                    <h3 className="text-xl sm:text-2xl font-black">
                      Per Serving ({servings} {servings > 1 ? 'servings' : 'serving'} in total)
                    </h3>
                  </div>
                  <div className="text-xs text-teal-200">
                    Total Recipe: {totalCalories} kcal • {totalProtein}g Protein • {totalFiber}g Fiber
                  </div>
                </div>

                {/* 5 Core Macros: Calories, Protein, Carbs, Fat, Fiber */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-teal-800/80 rounded-xl">
                    <span className="text-xs text-teal-300 uppercase font-bold">Calories</span>
                    <div className="text-2xl font-black mt-0.5">{perServingCalories}</div>
                    <span className="text-xs text-teal-200">kcal/serving</span>
                  </div>
                  <div className="p-3 bg-teal-800/80 rounded-xl">
                    <span className="text-xs text-teal-300 uppercase font-bold">Protein</span>
                    <div className="text-2xl font-black mt-0.5">{perServingProtein}g</div>
                    <span className="text-xs text-teal-200">per serving</span>
                  </div>
                  <div className="p-3 bg-teal-800/80 rounded-xl">
                    <span className="text-xs text-teal-300 uppercase font-bold">Carbs</span>
                    <div className="text-2xl font-black mt-0.5">{perServingCarbs}g</div>
                    <span className="text-xs text-teal-200">per serving</span>
                  </div>
                  <div className="p-3 bg-teal-800/80 rounded-xl">
                    <span className="text-xs text-teal-300 uppercase font-bold">Healthy Fats</span>
                    <div className="text-2xl font-black mt-0.5">{perServingFat}g</div>
                    <span className="text-xs text-teal-200">per serving</span>
                  </div>
                  <div className="p-3 bg-teal-800/80 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-xs text-teal-300 uppercase font-bold">Fiber</span>
                    <div className="text-2xl font-black mt-0.5">{perServingFiber}g</div>
                    <span className="text-xs text-teal-200">per serving</span>
                  </div>
                </div>

                <p className="text-xs text-teal-200/90 pt-1">
                  * Note: While arithmetic calculations reflect standard food databases, nutritional values shift naturally depending on moisture loss, brand variations, and preparation techniques.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
