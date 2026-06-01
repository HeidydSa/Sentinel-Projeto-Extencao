import db from '../config/db_config';

import { Usuario } from '../models/Usuario.model';

export const USUARIO = 'usuarios';

export class UsuarioFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(db, USUARIO)
    );
    const usuarios = [];
    querySnapshot.forEach((s) => {
      const data = s.data();
      usuarios.push(this.fromPersisted(s.id, data));
    });
    return usuarios;
  }

  async getById(id) {
    const docRef = this.firebase.doc(db, USUARIO, id);
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
      this.firebase.collection(db, USUARIO),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();
    const docRef = this.firebase.doc(db, USUARIO, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(db, USUARIO, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Usuario(
      id,
      data.nome,
      data.sobrenome,
      data.email,
      data.senha,
      data.funcaoId,
      data.dataCriacao
    );
  }
}
