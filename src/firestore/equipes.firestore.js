import db from '../config/db_config.js';

import { Equipe } from '../models/Equipe.model.js';

export const EQUIPE = 'equipes';

export class EquipeFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, EQUIPE)
    );
    const equipes = [];
    querySnapshot.forEach((s) => {
      const data = s.data();
      equipes.push(this.fromPersisted(s.id, data));
    });
    return equipes;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, EQUIPE, id);
    const querySnapshot = await this.firebase.getDoc(docRef);
    if (querySnapshot.exists()) {
      const data = querySnapshot.data();
      return this.fromPersisted(querySnapshot.id, data);
    }
    return null;
  }

  async create(data) {
    const persisted = data.toPersisted();

    const docRef = await this.firebase.addDoc(
      this.firebase.collection(db, EQUIPE),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();

    const docRef = this.firebase.doc(db, EQUIPE, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, EQUIPE, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Equipe(id, data.nome, data.id_lider, data.data_criacao);
  }
}
