import { Tarefa } from '../models/Tarefa.model.js';

export const TAREFA = 'tarefas';

export class TarefaFirestore {
  constructor({ firebase, db, usuarioFirestore, comentarioFirestore }) {
    this.firebase = firebase;
    this.db = db;
    this.usuarioFirestore = usuarioFirestore;
    this.comentarioFirestore = comentarioFirestore;
  }

  async getAll() {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.collection(this.db, TAREFA)
    );
    const tarefas = await Promise.all(
      querySnapshot.docs.map(async (s) => {
        const data = s.data();
        const responsavel = await this.usuarioFirestore.getById(
          data.id_responsavel
        );
        data.comentarios = await this.comentarioFirestore.getAll(s.id);

        if (responsavel) {
          data.responsavel = responsavel;
        } else {
          data.responsavel = null;
          data.id_responsavel = '';
        }

        return this.fromPersisted(s.id, data);
      })
    );
    return tarefas;
  }

  async getById(id) {
    const docRef = this.firebase.doc(this.db, TAREFA, id);
    const docSnap = await this.firebase.getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const responsavel = await this.usuarioFirestore.getById(
        data.id_responsavel
      );
      data.comentarios = await this.comentarioFirestore.getAll(docSnap.id);

      if (responsavel) {
        data.responsavel = responsavel;
      } else {
        data.responsavel = null;
        data.id_responsavel = '';
      }

      return this.fromPersisted(docSnap.id, data);
    }
    return null;
  }

  async create(data) {
    const persisted = data.toPersisted();
    const docRef = await this.firebase.addDoc(
      this.firebase.collection(this.db, TAREFA),
      {
        ...persisted,
      }
    );

    return docRef.id;
  }

  async update(id, updateData) {
    const persisted = updateData.toPersisted();
    const docRef = this.firebase.doc(this.db, TAREFA, id);
    await this.firebase.updateDoc(docRef, { ...persisted });
  }

  async delete(id) {
    const docRef = this.firebase.doc(this.db, TAREFA, id);
    await this.firebase.deleteDoc(docRef);
  }

  fromPersisted(id, data) {
    return new Tarefa({
      id: id,
      titulo: data.titulo,
      data: data.data,
      economia: data.economia,
      idProjeto: data.id_projeto,
      idCriador: data.id_criador,
      idResponsavel: data.id_responsavel,
      status: data.status,
      responsavel: data.responsavel,
      descricao: data.descricao,
      comentarios: data.comentarios,
    });
  }
}
