import React, { useState } from 'react';
import { Download, Eye, Layers, Users, MessageSquare, Vote, Settings, FileText } from 'lucide-react';

const FlowchartDesigner = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [showExportOptions, setShowExportOptions] = useState(false);

  const views = {
    overview: 'Visão Geral',
    authentication: 'Autenticação',
    ideas: 'Gerenciamento de Ideias',
    comments: 'Sistema de Comentários',
    admin: 'Administração'
  };

  const colors = {
    user: '#3B82F6',
    system: '#10B981',
    admin: '#EF4444',
    database: '#8B5CF6',
    api: '#F59E0B'
  };

  const exportFormats = [
    { name: 'SVG', desc: 'Escalável para o Figma' },
    { name: 'PNG', desc: 'Alta resolução' },
    { name: 'JSON', desc: 'Dados estruturados' },
    { name: 'BPMN', desc: 'Camunda/Bizagi' }
  ];

  const flowchartData = {
    overview: {
      title: 'Visão Geral do Sistema',
      nodes: [
        { id: 1, label: 'Usuário\nAutenticado', type: 'user', x: 50, y: 20 },
        { id: 2, label: 'Visualizar\nIdeias', type: 'system', x: 50, y: 120 },
        { id: 3, label: 'Criar\nIdeia', type: 'user', x: 20, y: 220 },
        { id: 4, label: 'Votar em\nIdeia', type: 'user', x: 50, y: 220 },
        { id: 5, label: 'Comentar\nIdeia', type: 'user', x: 80, y: 220 },
        { id: 6, label: 'Sistema\nSalva Dados', type: 'system', x: 50, y: 320 },
        { id: 7, label: 'Recalcular\nMétricas', type: 'system', x: 50, y: 420 },
        { id: 8, label: 'Notificar\nUsuário', type: 'system', x: 50, y: 520 },
        { id: 9, label: 'Atualizar\nFeed', type: 'system', x: 50, y: 620 }
      ],
      connections: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 8, to: 9 }
      ]
    },
    authentication: {
      title: 'Processo de Autenticação',
      nodes: [
        { id: 1, label: 'Início', type: 'user', x: 50, y: 20 },
        { id: 2, label: 'Preencher\nFormulário', type: 'user', x: 50, y: 120 },
        { id: 3, label: 'Validar\nDados', type: 'system', x: 50, y: 220 },
        { id: 4, label: 'Dados\nVálidos?', type: 'api', x: 50, y: 320 },
        { id: 5, label: 'Criar\nConta', type: 'database', x: 20, y: 420 },
        { id: 6, label: 'Gerar\nToken JWT', type: 'system', x: 20, y: 520 },
        { id: 7, label: 'Login\nSucesso', type: 'user', x: 20, y: 620 },
        { id: 8, label: 'Mostrar\nErro', type: 'user', x: 80, y: 420 }
      ],
      connections: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5, label: 'Sim' },
        { from: 4, to: 8, label: 'Não' },
        { from: 5, to: 6 },
        { from: 6, to: 7 }
      ]
    },
    ideas: {
      title: 'Gerenciamento de Ideias',
      nodes: [
        { id: 1, label: 'Usuário\nLogado', type: 'user', x: 50, y: 20 },
        { id: 2, label: 'Nova\nIdeia', type: 'user', x: 30, y: 120 },
        { id: 3, label: 'Listar\nIdeias', type: 'user', x: 70, y: 120 },
        { id: 4, label: 'Validar\nCategoria', type: 'system', x: 30, y: 220 },
        { id: 5, label: 'Salvar no\nBanco', type: 'database', x: 30, y: 320 },
        { id: 6, label: 'Aplicar\nFiltros', type: 'system', x: 70, y: 220 },
        { id: 7, label: 'Retornar\nResultados', type: 'api', x: 70, y: 320 },
        { id: 8, label: 'Exibir\nIdeias', type: 'user', x: 50, y: 420 }
      ],
      connections: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 4, to: 5 },
        { from: 3, to: 6 },
        { from: 6, to: 7 },
        { from: 5, to: 8 },
        { from: 7, to: 8 }
      ]
    },
    comments: {
      title: 'Sistema de Comentários',
      nodes: [
        { id: 1, label: 'Visualizar\nIdeia', type: 'user', x: 50, y: 20 },
        { id: 2, label: 'Escrever\nComentário', type: 'user', x: 50, y: 120 },
        { id: 3, label: 'Validar\nConteúdo', type: 'system', x: 50, y: 220 },
        { id: 4, label: 'Salvar\nComentário', type: 'database', x: 50, y: 320 },
        { id: 5, label: 'Atualizar\nContador', type: 'system', x: 50, y: 420 },
        { id: 6, label: 'Notificar\nAutor', type: 'system', x: 50, y: 520 },
        { id: 7, label: 'Exibir\nComentário', type: 'user', x: 50, y: 620 }
      ],
      connections: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 6 },
        { from: 6, to: 7 }
      ]
    },
    admin: {
      title: 'Painel Administrativo',
      nodes: [
        { id: 1, label: 'Admin\nLogin', type: 'admin', x: 50, y: 20 },
        { id: 2, label: 'Dashboard', type: 'admin', x: 50, y: 120 },
        { id: 3, label: 'Gerenciar\nUsuários', type: 'admin', x: 20, y: 220 },
        { id: 4, label: 'Moderar\nConteúdo', type: 'admin', x: 50, y: 220 },
        { id: 5, label: 'Visualizar\nStats', type: 'admin', x: 80, y: 220 },
        { id: 6, label: 'Processar\nAção', type: 'system', x: 50, y: 320 },
        { id: 7, label: 'Atualizar\nBanco', type: 'database', x: 50, y: 420 },
        { id: 8, label: 'Confirmar\nAção', type: 'admin', x: 50, y: 520 }
      ],
      connections: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
        { from: 6, to: 7 },
        { from: 7, to: 8 }
      ]
    }
  };

  const currentFlow = flowchartData[selectedView];

  const getNodeColor = (type) => colors[type] || colors.system;

  const copyToClipboard = (format) => {
    const data = JSON.stringify(flowchartData, null, 2);
    navigator.clipboard.writeText(data);
    alert(`Dados copiados em formato ${format}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎯 Comunidade Ativa - Fluxograma BPMN
              </h1>
              <p className="text-white/70">
                API RESTful com PostgreSQL - Pronto para Figma
              </p>
            </div>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Download size={20} />
              Exportar
            </button>
          </div>

          {/* Export Options */}
          {showExportOptions && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {exportFormats.map((format) => (
                <button
                  key={format.name}
                  onClick={() => copyToClipboard(format.name)}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-white font-bold mb-1">{format.name}</div>
                  <div className="text-white/60 text-sm">{format.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(views).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedView(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                  selectedView === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {key === 'overview' && <Eye size={16} />}
                {key === 'authentication' && <Users size={16} />}
                {key === 'ideas' && <Layers size={16} />}
                {key === 'comments' && <MessageSquare size={16} />}
                {key === 'admin' && <Settings size={16} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Flowchart Canvas */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {currentFlow.title}
          </h2>

          {/* SVG Canvas */}
          <div className="bg-white rounded-xl p-8 min-h-[800px] relative overflow-auto">
            <svg width="100%" height="800" className="mx-auto">
              {/* Draw connections first */}
              {currentFlow.connections.map((conn, idx) => {
                const fromNode = currentFlow.nodes.find(n => n.id === conn.from);
                const toNode = currentFlow.nodes.find(n => n.id === conn.to);
                
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x * 8;
                const y1 = fromNode.y + 40;
                const x2 = toNode.x * 8;
                const y2 = toNode.y - 10;

                return (
                  <g key={idx}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    {conn.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2}
                        fill="#64748b"
                        fontSize="12"
                        textAnchor="middle"
                        className="font-medium"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw nodes */}
              {currentFlow.nodes.map((node) => (
                <g key={node.id}>
                  <rect
                    x={node.x * 8 - 60}
                    y={node.y - 25}
                    width="120"
                    height="50"
                    rx="10"
                    fill={getNodeColor(node.type)}
                    className="drop-shadow-lg"
                  />
                  <text
                    x={node.x * 8}
                    y={node.y + 5}
                    fill="white"
                    fontSize="13"
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.label.split('\n').map((line, i) => (
                      <tspan key={i} x={node.x * 8} dy={i === 0 ? 0 : 16}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              ))}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-5 gap-4">
            {Object.entries(colors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white/80 text-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={20} />
            Como Usar no Figma
          </h3>
          <div className="space-y-3 text-white/80">
            <p>
              <strong>1.</strong> Clique em "Exportar" e escolha o formato SVG
            </p>
            <p>
              <strong>2.</strong> Abra o Figma e crie um novo frame
            </p>
            <p>
              <strong>3.</strong> Arraste o arquivo SVG para o Figma ou copie os dados JSON
            </p>
            <p>
              <strong>4.</strong> Use as cores e estilos como base para seu design
            </p>
            <p>
              <strong>5.</strong> Personalize conforme necessário
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">
            📡 Principais Endpoints da API
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-blue-400 font-mono text-sm mb-2">
                POST /api/auth/register
              </div>
              <div className="text-white/70 text-sm">Criar conta</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-green-400 font-mono text-sm mb-2">
                GET /api/ideas
              </div>
              <div className="text-white/70 text-sm">Listar ideias</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-purple-400 font-mono text-sm mb-2">
                POST /api/ideas/:id/vote
              </div>
              <div className="text-white/70 text-sm">Votar em ideia</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-orange-400 font-mono text-sm mb-2">
                GET /api/stats
              </div>
              <div className="text-white/70 text-sm">Estatísticas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartDesigner;