import db from '../config/db_config';

import { Tarefa } from '../models/Tarefa.model';

export const TAREFA = 'tarefas';

export class TarefaFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, TAREFA)
    );
    const tarefas = [];
    querySnapshot.forEach((s) => {
      const data = s.data();
      tarefas.push(this.fromPersisted(s.id, data));
    });
    return tarefas;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, TAREFA, id);
    const docSnap = await this.firebase.getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return this.fromPersisted(docSnap.id, data);
    }
    return null;
  }

  async create(data) {
    const persisted = data.toPersisted();
    const docRef = await this.firebase.addDoc(
      this.firebase.collection(db, TAREFA),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();
    const docRef = this.firebase.doc(db, TAREFA, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, TAREFA, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Tarefa(
      id,
      data.titulo,
      data.data,
      data.economia,
      data.id_projeto,
      data.id_criador,
      data.id_responsavel,
      data.id_andamento_tarefa,
      data.status
    );
  }
}
