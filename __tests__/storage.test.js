import { saveTasks, loadTasks } from '../main.js';

describe('Storage', () => {
  beforeEach(() => localStorage.clear());
  it('deve salvar e carregar tarefas', () => {
    const tasks = [{ day:'segunda', time:'08:00', desc:'Teste' }];
    saveTasks(tasks);
    expect(loadTasks()).toEqual(tasks);
  });
});
