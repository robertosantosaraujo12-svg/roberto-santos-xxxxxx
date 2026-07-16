import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { Project, Company, CrmContact, CrmActivity } from '../types';

// Fallback localStorage cache keys
const KEYS = {
  COMPANIES: 'piramidy_companies',
  PROJECTS: 'piramidy_projects',
  CONTACTS: 'piramidy_contacts',
  ACTIVITIES: 'piramidy_activities',
};

/**
 * Loads all companies. If Firestore is active, reads from there.
 * If empty in Firestore, seeds it with initial data.
 */
export async function loadCompanies(initialData: Company[]): Promise<Company[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'companies');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        // Seed initial data to Firestore
        console.log('Seeding initial companies to Firestore...');
        for (const comp of initialData) {
          await setDoc(doc(db, 'companies', comp.id), comp);
        }
        return initialData;
      }
      const list: Company[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Company);
      });
      return list;
    } catch (error) {
      console.error('Error loading companies from Firestore, falling back to local:', error);
    }
  }

  // LocalStorage Fallback
  const cached = localStorage.getItem(KEYS.COMPANIES);
  if (cached) {
    return JSON.parse(cached);
  } else {
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(initialData));
    return initialData;
  }
}

/**
 * Saves a company or updates the whole array.
 */
export async function saveCompaniesState(companies: Company[]): Promise<void> {
  // Always update LocalStorage cache
  localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));

  if (isFirebaseConfigured && db) {
    try {
      // In Firestore, we save each company as a document.
      // To keep it simple and synchronized, we setDoc for each company.
      const batch = writeBatch(db);
      for (const comp of companies) {
        const docRef = doc(db, 'companies', comp.id);
        batch.set(docRef, comp);
      }
      await batch.commit();
    } catch (error) {
      console.error('Error saving companies to Firestore:', error);
    }
  }
}

export async function saveSingleCompany(company: Company): Promise<void> {
  // Update local storage
  const cached = localStorage.getItem(KEYS.COMPANIES);
  let list: Company[] = cached ? JSON.parse(cached) : [];
  list = list.filter(c => c.id !== company.id);
  list.push(company);
  localStorage.setItem(KEYS.COMPANIES, JSON.stringify(list));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'companies', company.id), company);
    } catch (error) {
      console.error('Error saving single company to Firestore:', error);
    }
  }
}

/**
 * Loads all projects.
 */
export async function loadProjects(initialData: Project[]): Promise<Project[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'projects');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log('Seeding initial projects to Firestore...');
        for (const proj of initialData) {
          await setDoc(doc(db, 'projects', proj.id), proj);
        }
        return initialData;
      }
      const list: Project[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Project);
      });
      return list;
    } catch (error) {
      console.error('Error loading projects from Firestore, falling back:', error);
    }
  }

  const cached = localStorage.getItem(KEYS.PROJECTS);
  if (cached) {
    return JSON.parse(cached);
  } else {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(initialData));
    return initialData;
  }
}

/**
 * Saves the entire projects array to storage.
 */
export async function saveProjectsState(projects: Project[]): Promise<void> {
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const proj of projects) {
        const docRef = doc(db, 'projects', proj.id);
        batch.set(docRef, proj);
      }
      await batch.commit();
    } catch (error) {
      console.error('Error saving projects to Firestore:', error);
    }
  }
}

export async function saveSingleProject(project: Project): Promise<void> {
  // Update local storage
  const cached = localStorage.getItem(KEYS.PROJECTS);
  let list: Project[] = cached ? JSON.parse(cached) : [];
  list = list.map(p => p.id === project.id ? project : p);
  if (!list.some(p => p.id === project.id)) {
    list.push(project);
  }
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(list));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'projects', project.id), project);
    } catch (error) {
      console.error('Error saving project to Firestore:', error);
    }
  }
}

export async function deleteSingleProject(projectId: string): Promise<void> {
  const cached = localStorage.getItem(KEYS.PROJECTS);
  if (cached) {
    let list: Project[] = JSON.parse(cached);
    list = list.filter(p => p.id !== projectId);
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(list));
  }

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error('Error deleting project from Firestore:', error);
    }
  }
}

/**
 * Loads all contacts.
 */
export async function loadContacts(initialData: CrmContact[]): Promise<CrmContact[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'contacts');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log('Seeding initial contacts to Firestore...');
        for (const cont of initialData) {
          await setDoc(doc(db, 'contacts', cont.id), cont);
        }
        return initialData;
      }
      const list: CrmContact[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CrmContact);
      });
      return list;
    } catch (error) {
      console.error('Error loading contacts from Firestore, falling back:', error);
    }
  }

  const cached = localStorage.getItem(KEYS.CONTACTS);
  if (cached) {
    return JSON.parse(cached);
  } else {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(initialData));
    return initialData;
  }
}

/**
 * Saves contacts state.
 */
export async function saveContactsState(contacts: CrmContact[]): Promise<void> {
  localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const cont of contacts) {
        const docRef = doc(db, 'contacts', cont.id);
        batch.set(docRef, cont);
      }
      await batch.commit();
    } catch (error) {
      console.error('Error saving contacts to Firestore:', error);
    }
  }
}

/**
 * Loads CRM activities.
 */
export async function loadActivities(initialData: CrmActivity[]): Promise<CrmActivity[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'activities');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log('Seeding initial activities to Firestore...');
        for (const act of initialData) {
          await setDoc(doc(db, 'activities', act.id), act);
        }
        return initialData;
      }
      const list: CrmActivity[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CrmActivity);
      });
      return list;
    } catch (error) {
      console.error('Error loading activities from Firestore, falling back:', error);
    }
  }

  const cached = localStorage.getItem(KEYS.ACTIVITIES);
  if (cached) {
    return JSON.parse(cached);
  } else {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(initialData));
    return initialData;
  }
}

/**
 * Saves activities state.
 */
export async function saveActivitiesState(activities: CrmActivity[]): Promise<void> {
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const act of activities) {
        const docRef = doc(db, 'activities', act.id);
        batch.set(docRef, act);
      }
      await batch.commit();
    } catch (error) {
      console.error('Error saving activities to Firestore:', error);
    }
  }
}
