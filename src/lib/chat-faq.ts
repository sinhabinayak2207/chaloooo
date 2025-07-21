import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  priority: number;
}

/**
 * Initialize the FAQ collection with some default questions and answers
 */
export const initializeFAQCollection = async () => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    
    // Check if the FAQ collection exists and has items
    const faqRef = collection(db, 'faq');
    const snapshot = await getDocs(faqRef);
    
    if (snapshot.empty) {
      // Add default FAQs
      const defaultFAQs: FAQ[] = [
        {
          question: "What products do you offer?",
          answer: "We offer a wide range of bulk products including Rice, Seeds, Oil, Minerals, Bromine, Sugar, and Special Category products. You can browse all our categories on the categories page.",
          keywords: ["products", "offer", "sell", "categories", "what products"],
          category: "products",
          priority: 10
        },
        {
          question: "How can I contact your team?",
          answer: "You can contact our team through this live chat, by email at contact@occworld.com, or by phone at +1-234-567-8900. Our office hours are Monday to Friday, 9 AM to 5 PM.",
          keywords: ["contact", "reach", "email", "phone", "support"],
          category: "contact",
          priority: 9
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship our products internationally. Shipping costs and delivery times vary depending on your location and the volume of products ordered. Please contact our sales team for specific shipping information.",
          keywords: ["shipping", "international", "delivery", "worldwide"],
          category: "shipping",
          priority: 8
        },
        {
          question: "What are your minimum order quantities?",
          answer: "Minimum order quantities vary by product category. For most products, we require a minimum order of 1 ton. Please check the specific product page or contact our sales team for detailed information.",
          keywords: ["minimum", "order", "quantity", "MOQ"],
          category: "orders",
          priority: 7
        },
        {
          question: "How do I place an order?",
          answer: "To place an order, you can either contact our sales team directly through this chat, send an email to orders@occworld.com, or call us at +1-234-567-8900. We'll guide you through the ordering process.",
          keywords: ["order", "purchase", "buy", "ordering process"],
          category: "orders",
          priority: 6
        }
      ];
      
      // Add each FAQ to the collection
      for (const faq of defaultFAQs) {
        await addDoc(faqRef, faq);
      }
      
      console.log('FAQ collection initialized with default questions');
      return true;
    } else {
      console.log('FAQ collection already exists');
      return true;
    }
  } catch (error) {
    console.error('Error initializing FAQ collection:', error);
    return false;
  }
};

/**
 * Add a new FAQ to the database
 */
export const addFAQ = async (faq: FAQ) => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const faqRef = collection(db, 'faq');
    
    const docRef = await addDoc(faqRef, faq);
    return docRef.id;
  } catch (error) {
    console.error('Error adding FAQ:', error);
    throw error;
  }
};

/**
 * Get all FAQs from the database
 */
export const getAllFAQs = async () => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    const faqRef = collection(db, 'faq');
    const snapshot = await getDocs(faqRef);
    
    const faqs: FAQ[] = [];
    snapshot.forEach((doc) => {
      faqs.push({
        id: doc.id,
        ...doc.data() as FAQ
      });
    });
    
    return faqs;
  } catch (error) {
    console.error('Error getting FAQs:', error);
    throw error;
  }
};

/**
 * Find a matching FAQ for a given query
 */
export const findMatchingFAQ = async (query: string) => {
  try {
    const faqs = await getAllFAQs();
    
    // Convert query to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();
    
    // Score each FAQ based on keyword matches
    const scoredFaqs = faqs.map(faq => {
      let score = 0;
      
      // Check for exact question match
      if (faq.question.toLowerCase() === lowerQuery) {
        score += 100;
      }
      
      // Check for partial question match
      if (faq.question.toLowerCase().includes(lowerQuery)) {
        score += 50;
      }
      
      // Check for keyword matches
      for (const keyword of faq.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 30;
        }
      }
      
      // Add priority score
      score += faq.priority;
      
      return {
        faq,
        score
      };
    });
    
    // Sort by score (highest first)
    scoredFaqs.sort((a, b) => b.score - a.score);
    
    // Return the best match if it has a score above threshold
    if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 30) {
      return scoredFaqs[0].faq;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding matching FAQ:', error);
    return null;
  }
};

/**
 * Store a chat session document with the provided ID
 */
export const storeChatSession = async (documentId: string, sessionData: any) => {
  try {
    const app = getApps().length > 0 ? getApp() : null;
    if (!app) {
      throw new Error('Firebase app not initialized');
    }
    
    const db = getFirestore(app);
    await setDoc(doc(db, 'chatSessions', documentId), sessionData);
    
    return true;
  } catch (error) {
    console.error('Error storing chat session:', error);
    return false;
  }
};
