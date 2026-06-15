import { db } from '../config/db_config.js';

import { Funcao } from '../models/Funcao.model.js';

export const FUNCAO = 'funcoes';

export class FuncaoFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, FUNCAO)
    );
    const funcoes = [];
    querySnapshot.forEach((s) => {
      const data = s.data();
      funcoes.push(this.fromPersisted(s.id, data));
    });
    return funcoes;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, FUNCAO, id);
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
      this.firebase.collection(db, FUNCAO),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();
    const docRef = this.firebase.doc(db, FUNCAO, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, FUNCAO, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Funcao(id, data.tipo, data.dataCriacao);
  }
}
