import { db } from '../config/db_config.js';
export const MEMBRO_EQUIPE = 'membros';
export const EQUIPE_MEMBROS_PATH = 'equipes';

export class MembroEquipeFirestore {
  constructor(firebase) {
    this.firebase = firebase;
  }

  async create(equipeId, usuarioId) {
    const docRef = this.firebase.doc(
      db,
      EQUIPE_MEMBROS_PATH,
      equipeId,
      MEMBRO_EQUIPE,
      usuarioId
    );
    await this.firebase.setDoc(docRef, {
      id_equipe: equipeId,
      id_usuario: usuarioId,
      dataCriacao: new Date().toISOString(),
    });

    return docRef.id;
  }

  async getById(equipeId, usuarioId) {
    const docRef = this.firebase.doc(
      db,
      EQUIPE_MEMBROS_PATH,
      equipeId,
      MEMBRO_EQUIPE,
      usuarioId
    );
    const docSnap = await this.firebase.getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  }

  async getAllByEquipe(equipeId) {
    const querySnapshot = await this.firebase.getDocs(
      this.firebase.query(
        this.firebase.collection(
          db,
          EQUIPE_MEMBROS_PATH,
          equipeId,
          MEMBRO_EQUIPE
        ),
        this.firebase.where('id_equipe', '==', equipeId)
      )
    );

    const membros = [];
    querySnapshot.forEach((s) => {
      membros.push({ id: s.id, ...s.data() });
    });

    return membros;
  }

  async delete(equipeId, usuarioId) {
    const docRef = this.firebase.doc(
      db,
      EQUIPE_MEMBROS_PATH,
      equipeId,
      MEMBRO_EQUIPE,
      usuarioId
    );
    await this.firebase.deleteDoc(docRef);
  }
}
