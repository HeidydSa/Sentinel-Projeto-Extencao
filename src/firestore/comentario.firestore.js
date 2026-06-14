import { Comentario } from '../models/Comentario.model.js';

export const COMENTARIOS = 'comentarios';
export const TAREFA = 'tarefas';

export class ComentarioFirestore {
  constructor({ firebase, db }) {
    this.db = db;
    this.firebase = firebase;
  }

  async getAll(tarefaId, fallbackComentarios = []) {
    const comentariosRef = this.firebase.collection(
      this.db,
      TAREFA,
      tarefaId,
      COMENTARIOS
    );

    const querySnapshot = await this.firebase.getDocs(comentariosRef);
    const comentarios = querySnapshot.docs.map((docSnap) =>
      this.fromPersisted(docSnap.id, docSnap.data())
    );

    if (comentarios.length > 0) {
      return comentarios.sort((a, b) => a.dataCriacao - b.dataCriacao);
    }

    if (Array.isArray(fallbackComentarios) && fallbackComentarios.length > 0) {
      return fallbackComentarios
        .map((comentario, index) =>
          this.fromPersisted(
            comentario.id ?? `${tarefaId}-${index}`,
            comentario
          )
        )
        .sort((a, b) => a.dataCriacao - b.dataCriacao);
    }

    return [];
  }

  async create(tarefaId, comentario) {
    const comentariosRef = this.firebase.collection(
      this.db,
      TAREFA,
      tarefaId,
      COMENTARIOS
    );

    const docRef = await this.firebase.addDoc(comentariosRef, {
      ...comentario.toPersisted(),
    });

    return docRef.id;
  }

  async delete(tarefaId, comentarioId) {
    const comentarioRef = this.firebase.doc(
      this.db,
      TAREFA,
      tarefaId,
      COMENTARIOS,
      comentarioId
    );

    await this.firebase.deleteDoc(comentarioRef);
  }

  fromPersisted(id, data) {
    if (data instanceof Comentario) {
      return data;
    }

    return new Comentario({
      id,
      idUsuario: data.id_usuario ?? data.idUsuario,
      detalhe: data.detalhe ?? '',
      dataCriacao: data.data_criacao ?? data.dataCriacao,
    });
  }
}
