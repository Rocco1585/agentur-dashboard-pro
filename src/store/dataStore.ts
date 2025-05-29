
import { create } from 'zustand';

export interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  stage: string;
  priority: string;
  satisfaction: number;
  nextAppointment: string;
  bookedAppointments: number;
  completedAppointments: number;
  paymentStatus: string;
  statuses: string[];
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  performance: number;
  earnings: number;
  appointmentsSet: number;
  successRate: number;
  startDate: string;
  avatar: string;
}

export interface Todo {
  id: number;
  task: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  description: string;
}

export interface Revenue {
  id: number;
  client: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

export interface Settings {
  paymentPerAppointment: number;
}

interface DataStore {
  customers: Customer[];
  teamMembers: TeamMember[];
  todos: Todo[];
  revenues: Revenue[];
  expenses: Expense[];
  settings: Settings;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: number, customer: Partial<Customer>) => void;
  deleteCustomer: (id: number) => void;
  
  // Team member actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: number, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: number) => void;
  
  // Todo actions
  addTodo: (todo: Omit<Todo, 'id'>) => void;
  updateTodo: (id: number, todo: Partial<Todo>) => void;
  deleteTodo: (id: number) => void;
  
  // Revenue actions
  addRevenue: (revenue: Omit<Revenue, 'id'>) => void;
  updateRevenue: (id: number, revenue: Partial<Revenue>) => void;
  deleteRevenue: (id: number) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: number, expense: Partial<Expense>) => void;
  deleteExpense: (id: number) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  customers: [
    {
      id: 1,
      name: 'ABC GmbH',
      contact: 'Max Mustermann',
      email: 'max@abc-gmbh.de',
      phone: '+49 123 456789',
      stage: 'test-active',
      priority: 'A Kunde',
      satisfaction: 8,
      nextAppointment: '15.01.2025',
      bookedAppointments: 12,
      completedAppointments: 8,
      paymentStatus: 'bezahlt',
      statuses: ['testphase aktiv']
    },
    {
      id: 2,
      name: 'XYZ Corp',
      contact: 'Lisa Schmidt',
      email: 'lisa@xyz-corp.com',
      phone: '+49 987 654321',
      stage: 'upsell-pending',
      priority: 'B Kunde',
      satisfaction: 9,
      nextAppointment: '18.01.2025',
      bookedAppointments: 8,
      completedAppointments: 6,
      paymentStatus: 'ausstehend',
      statuses: ['upsell bevorstehend']
    },
    {
      id: 3,
      name: 'DEF AG',
      contact: 'Tom Weber',
      email: 'tom@def-ag.de',
      phone: '+49 555 123456',
      stage: 'existing',
      priority: 'A Kunde',
      satisfaction: 7,
      nextAppointment: '20.01.2025',
      bookedAppointments: 15,
      completedAppointments: 12,
      paymentStatus: 'raten',
      statuses: ['bestandskunde']
    },
  ],
  
  teamMembers: [
    {
      id: 1,
      name: 'Max Mustermann',
      email: 'max@vertrieb.de',
      phone: '+49 123 456789',
      position: 'Vertriebsagentur closing b2c',
      performance: 9,
      earnings: 4500,
      appointmentsSet: 24,
      successRate: 85,
      startDate: '01.03.2024',
      avatar: 'MM'
    },
    {
      id: 2,
      name: 'Lisa Schmidt',
      email: 'lisa@vertrieb.de',
      phone: '+49 987 654321',
      position: 'Vertriebsagentur setting b2c',
      performance: 8,
      earnings: 3200,
      appointmentsSet: 18,
      successRate: 78,
      startDate: '15.05.2024',
      avatar: 'LS'
    },
    {
      id: 3,
      name: 'Tom Weber',
      email: 'tom@vertrieb.de',
      phone: '+49 555 123456',
      position: 'TikTok Poster',
      performance: 7,
      earnings: 2800,
      appointmentsSet: 0,
      successRate: 0,
      startDate: '10.08.2024',
      avatar: 'TW'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@vertrieb.de',
      phone: '+49 444 789123',
      position: 'Manager',
      performance: 10,
      earnings: 6500,
      appointmentsSet: 0,
      successRate: 95,
      startDate: '01.01.2024',
      avatar: 'SJ'
    }
  ],
  
  todos: [
    { 
      id: 1, 
      task: 'Follow-up mit ABC GmbH', 
      assignee: 'Max Mustermann', 
      dueDate: '2025-01-28', 
      priority: 'hoch', 
      status: 'offen',
      description: 'Nachfassen bezüglich des neuen Projekts'
    },
    { 
      id: 2, 
      task: 'Angebot für XYZ Corp erstellen', 
      assignee: 'Lisa Schmidt', 
      dueDate: '2025-01-29', 
      priority: 'mittel', 
      status: 'in arbeit',
      description: 'Detailliertes Angebot für Webdesign-Projekt'
    },
    { 
      id: 3, 
      task: 'Vertrag mit DEF AG prüfen', 
      assignee: 'Tom Weber', 
      dueDate: '2025-01-30', 
      priority: 'niedrig', 
      status: 'erledigt',
      description: 'Rechtliche Prüfung des Vertrags'
    },
    { 
      id: 4, 
      task: 'Quarterly Review vorbereiten', 
      assignee: 'Sarah Johnson', 
      dueDate: '2025-01-31', 
      priority: 'hoch', 
      status: 'offen',
      description: 'Quartalsbericht erstellen'
    },
    { 
      id: 5, 
      task: 'Neue Mitarbeiter einarbeiten', 
      assignee: 'Max Mustermann', 
      dueDate: '2025-02-01', 
      priority: 'mittel', 
      status: 'offen',
      description: 'Onboarding für neue Teammitglieder'
    },
    { 
      id: 6, 
      task: 'Marketing-Kampagne planen', 
      assignee: 'Lisa Schmidt', 
      dueDate: '2025-02-02', 
      priority: 'mittel', 
      status: 'offen',
      description: 'Neue Social Media Kampagne entwickeln'
    },
    { 
      id: 7, 
      task: 'Kundenfeedback auswerten', 
      assignee: 'Tom Weber', 
      dueDate: '2025-02-03', 
      priority: 'niedrig', 
      status: 'offen',
      description: 'Feedback der letzten Umfrage analysieren'
    },
    { 
      id: 8, 
      task: 'Team Meeting vorbereiten', 
      assignee: 'Sarah Johnson', 
      dueDate: '2025-02-04', 
      priority: 'hoch', 
      status: 'offen',
      description: 'Agenda für das nächste Teammeeting erstellen'
    },
  ],
  
  revenues: [
    { id: 1, client: 'ABC GmbH', amount: 2500, date: '2025-01-15' },
    { id: 2, client: 'XYZ Corp', amount: 1800, date: '2025-01-12' },
    { id: 3, client: 'DEF AG', amount: 3200, date: '2025-01-10' },
    { id: 4, client: 'GHI GmbH', amount: 1500, date: '2025-01-08' },
  ],
  
  expenses: [
    { id: 1, description: 'Marketing', amount: 500, date: '2025-01-14' },
    { id: 2, description: 'Büroausstattung', amount: 300, date: '2025-01-10' },
  ],
  
  settings: {
    paymentPerAppointment: 100
  },
  
  // Customer actions
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, { ...customer, id: Date.now() }]
  })),
  
  updateCustomer: (id, customerData) => set((state) => ({
    customers: state.customers.map(customer => 
      customer.id === id ? { ...customer, ...customerData } : customer
    )
  })),
  
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(customer => customer.id !== id)
  })),
  
  // Team member actions
  addTeamMember: (member) => set((state) => ({
    teamMembers: [...state.teamMembers, { ...member, id: Date.now() }]
  })),
  
  updateTeamMember: (id, memberData) => set((state) => ({
    teamMembers: state.teamMembers.map(member => 
      member.id === id ? { ...member, ...memberData } : member
    )
  })),
  
  deleteTeamMember: (id) => set((state) => ({
    teamMembers: state.teamMembers.filter(member => member.id !== id)
  })),
  
  // Todo actions
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, { ...todo, id: Date.now() }]
  })),
  
  updateTodo: (id, todoData) => set((state) => ({
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, ...todoData } : todo
    )
  })),
  
  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })),
  
  // Revenue actions
  addRevenue: (revenue) => set((state) => ({
    revenues: [...state.revenues, { ...revenue, id: Date.now() }]
  })),
  
  updateRevenue: (id, revenueData) => set((state) => ({
    revenues: state.revenues.map(revenue => 
      revenue.id === id ? { ...revenue, ...revenueData } : revenue
    )
  })),
  
  deleteRevenue: (id) => set((state) => ({
    revenues: state.revenues.filter(revenue => revenue.id !== id)
  })),
  
  // Expense actions
  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { ...expense, id: Date.now() }]
  })),
  
  updateExpense: (id, expenseData) => set((state) => ({
    expenses: state.expenses.map(expense => 
      expense.id === id ? { ...expense, ...expenseData } : expense
    )
  })),
  
  deleteExpense: (id) => set((state) => ({
    expenses: state.expenses.filter(expense => expense.id !== id)
  })),
  
  // Settings actions
  updateSettings: (settingsData) => set((state) => ({
    settings: { ...state.settings, ...settingsData }
  })),
}));
