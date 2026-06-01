import db from '../config/db_config';

import { Projeto } from '../models/Projeto.model';

export const PROJETO = 'projetos';

export class ProjetoFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, PROJETO)
    );
    const projetos = [];
    querySnapshot.forEach((s) => {
      const data = s.data();
      projetos.push(this.fromPersisted(s.id, data));
    });
    return projetos;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, PROJETO, id);
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
      this.firebase.collection(db, PROJETO),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();
    const docRef = this.firebase.doc(db, PROJETO, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, PROJETO, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Projeto(
      id,
      data.titulo,
      data.descricao,
      data.id_equipe,
      data.data_criacao
    );
  }
}
