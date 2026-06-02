import { db } from '../config/db_config.js';
import { AndamentoTarefa } from '../models/AndamentoTarefa.model.js';

export const ANDAMENTO_TAREFA = 'andamento_tarefas';

export class AndamentoTarefaFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async create(data) {
    const persisted = data.toPersisted();

    const docRef = await this.firebase.addDoc(
      this.firebase.collection(db, ANDAMENTO_TAREFA),
      {
        ...persisted,
      }
    );
    return docRef.id;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, ANDAMENTO_TAREFA, id);
    const docSnap = await this.firebase.getDoc(docRef);

    if (docSnap.exists()) {
      return this.fromPersisted(docSnap.id, docSnap.data());
    }
    return null;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, ANDAMENTO_TAREFA)
    );
    const andamentos = [];
    querySnapshot.forEach((doc) => {
      andamentos.push(this.fromPersisted(doc.id, doc.data()));
    });
    return andamentos;
  }

  async update(id, updatedData) {
    const docRef = this.firebase.doc(db, ANDAMENTO_TAREFA, id);
    await this.firebase.updateDoc(docRef, {
      ...updatedData.toPersisted(),
    });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, ANDAMENTO_TAREFA, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new AndamentoTarefa(id, data.titulo, data.ordem, data.dataCriacao);
  }
}
