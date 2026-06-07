import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Buscar todas as tarefas pendentes/em andamento com data limite
    const tarefas = await base44.asServiceRole.entities.TarefaMonitor.list();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const tarefasProximas = tarefas.filter(t => {
      if (!t.data_limite) return false;
      if (t.status === "concluida") return false;
      const limite = new Date(t.data_limite);
      limite.setHours(0, 0, 0, 0);
      const diffDias = Math.ceil((limite - hoje) / (1000 * 60 * 60 * 24));
      return diffDias <= 2 && diffDias >= 0; // vence hoje, amanhã ou depois de amanhã
    });

    if (tarefasProximas.length === 0) {
      return Response.json({ message: "Nenhuma tarefa próxima do prazo", notificacoes: 0 });
    }

    // Buscar todos os usuários líderes e supervisores
    const usuarios = await base44.asServiceRole.entities.User.list();
    const lideres = usuarios.filter(u =>
      u.cargo === "lider" || u.cargo === "supervisor" || u.role === "admin"
    );

    let total = 0;

    for (const tarefa of tarefasProximas) {
      const limite = new Date(tarefa.data_limite);
      limite.setHours(0, 0, 0, 0);
      const diffDias = Math.ceil((limite - hoje) / (1000 * 60 * 60 * 24));

      const urgencia = diffDias === 0 ? "🚨 VENCE HOJE" : diffDias === 1 ? "⚠️ Vence amanhã" : "📅 Vence em 2 dias";
      const tipo = diffDias === 0 ? "urgente" : "aviso";

      for (const lider of lideres) {
        // Verificar se já foi notificado hoje para esta tarefa
        const jaNotificado = await base44.asServiceRole.entities.Notificacao.filter({
          usuario_id: lider.id,
          categoria: "tarefa",
        });

        const jaNotifHoje = jaNotificado.some(n => {
          if (!n.link || !n.link.includes(tarefa.id)) return false;
          const criado = new Date(n.created_date);
          criado.setHours(0, 0, 0, 0);
          return criado.getTime() === hoje.getTime();
        });

        if (!jaNotifHoje) {
          await base44.asServiceRole.entities.Notificacao.create({
            usuario_id: lider.id,
            titulo: `${urgencia}: ${tarefa.titulo}`,
            mensagem: `A tarefa "${tarefa.titulo}" ${
              diffDias === 0 ? "vence hoje" : `vence em ${diffDias} dia(s)`
            }. Responsável: ${tarefa.responsavel || "Não definido"}. Prioridade: ${tarefa.prioridade || "média"}.`,
            tipo,
            categoria: "tarefa",
            link: `/MonitorArea`,
            lida: false,
            remetente_nome: "Sistema",
          });
          total++;
        }
      }
    }

    return Response.json({
      message: `${total} notificações enviadas para ${tarefasProximas.length} tarefa(s) próximas do prazo`,
      notificacoes: total,
      tarefas_proximas: tarefasProximas.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});