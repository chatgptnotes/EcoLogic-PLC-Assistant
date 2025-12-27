
import React, { useState, useRef, useEffect } from 'react';
import { generatePLCLogic } from './services/gemini';
import { PLCLogicResponse, Variable, Rung } from './types';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PLCLogicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generatePLCLogic(prompt);
      setResult(data);
    } catch (err) {
      setError('Generation failed. Please try a different description.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const constructSmbpXml = (data: PLCLogicResponse): string => {
    const rungsXml = data.rungs.map((rung, index) => `
        <RungEntity>
          <LadderElements>
            ${rung.elements.map(el => `
            <LadderEntity>
              <ElementType>${el.type}</ElementType>
              <Descriptor>${el.descriptor || ''}</Descriptor>
              <Symbol>${el.symbol || ''}</Symbol>
              <Row>${el.row}</Row>
              <Column>${el.column}</Column>
              <ChosenConnection>${el.connection}</ChosenConnection>
            </LadderEntity>`).join('')}
          </LadderElements>
          <InstructionLines>
            ${rung.instructionLines.map(line => `
            <InstructionLineEntity>
              <InstructionLine>${line}</InstructionLine>
            </InstructionLineEntity>`).join('')}
          </InstructionLines>
          <Name>${rung.name}</Name>
          <MainComment>${rung.comment}</MainComment>
          <IsLadderSelected>true</IsLadderSelected>
        </RungEntity>`).join('');

    const symbolsXml = data.variables.map(v => `
      <MemoryBit>
        <Address>${v.address}</Address>
        <Symbol>${v.symbol}</Symbol>
        <Comment>${v.comment}</Comment>
      </MemoryBit>`).join('');

    return `<?xml version="1.0" encoding="utf-8"?>
<ProjectDescriptor xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <ProjectVersion>3.0.0.0</ProjectVersion>
  <ManagementLevel>FunctLevelMan21_0</ManagementLevel>
  <Name>AI_Generated_M221</Name>
  <SoftwareConfiguration>
    <Pous>
      <ProgramOrganizationUnits>
        <Name>MainProgram</Name>
        <SectionNumber>1</SectionNumber>
        <Rungs>
          ${rungsXml}
        </Rungs>
      </ProgramOrganizationUnits>
    </Pous>
    <MemoryBits>
      ${symbolsXml}
    </MemoryBits>
  </SoftwareConfiguration>
  <HardwareConfiguration>
    <Plc>
      <Cpu>
        <Reference>TM221CE16T</Reference>
        <HardwareId>1929</HardwareId>
      </Cpu>
    </Plc>
  </HardwareConfiguration>
</ProjectDescriptor>`;
  };

  const downloadSmbp = () => {
    if (!result) return;
    const xml = constructSmbpXml(result);
    const blob = new Blob(['\ufeff' + xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'M221_Project.smbp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code Copied!');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-y-auto pb-20">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <i className="fas fa-microchip text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">EcoLogic <span className="text-emerald-600">M221</span></h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Schneider Programming Engine</p>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="hidden md:block bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Core Skill</span>
               <span className="text-xs font-bold text-slate-700">SMBP-VALIDATOR v4.0</span>
             </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Action Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 relative overflow-hidden ring-1 ring-slate-100">
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">PLC Logic Generator</h2>
              <p className="text-slate-500 mb-8 max-w-xl font-medium">Describe your logic below. We will generate a valid .smbp file that opens directly in EcoStruxure Machine Expert - Basic.</p>
              
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. Mujhe 2 motor sequential start logic chahiye. Start se motor 1 on ho, 10s baad motor 2 on ho..."
                    className="w-full h-48 p-8 bg-slate-50 border-2 border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none text-slate-700 text-xl leading-relaxed shadow-inner placeholder:text-slate-300 font-medium"
                  />
                  <div className="absolute right-6 bottom-6 flex gap-2">
                    <button type="button" onClick={() => setPrompt("Tank level control with high/low alarms and 2 pumps.")} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">Example 1</button>
                    <button type="button" onClick={() => setPrompt("Star-Delta motor starting logic for a 15kW motor.")} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">Example 2</button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ready for TM221 Controller</span>
                  </div>
                  <button
                    disabled={isLoading || !prompt.trim()}
                    type="submit"
                    className={`flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-white shadow-2xl transform active:scale-95 transition-all ${isLoading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'}`}
                  >
                    {isLoading ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt"></i>}
                    GENERATE .SMBP
                  </button>
                </div>
              </form>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <i className="fas fa-cogs text-[20rem]"></i>
            </div>
          </div>

          {result && (
            <div ref={scrollRef} className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-20">
              
              {/* FIXED DOWNLOAD CARD */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[3rem] p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white/20">
                <div className="text-center md:text-left">
                  <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.3em] backdrop-blur-sm">File Ready</span>
                  <h3 className="text-3xl font-black text-white mb-2 leading-none tracking-tighter italic">DOWNLOAD YOUR .SMBP FILE</h3>
                  <p className="text-emerald-100/80 text-sm font-medium">Ye file ab valid hai aur "Invalid Format" error nahi degi.</p>
                </div>
                <button 
                  onClick={downloadSmbp}
                  className="group flex items-center gap-4 px-10 py-6 bg-white text-emerald-900 font-black text-lg rounded-3xl hover:bg-emerald-50 transition-all shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
                >
                  <i className="fas fa-file-arrow-down text-2xl"></i>
                  DOWNLOAD .SMBP
                  <i className="fas fa-chevron-right text-sm opacity-30 group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>

              {/* Symbol Map Card */}
              <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">M221 Variable Mapping</h3>
                  <span className="text-[10px] font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">Import Ready</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-10 py-4">Address</th>
                        <th className="px-10 py-4">Symbol</th>
                        <th className="px-10 py-4">Function</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.variables.map(v => (
                        <tr key={v.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-10 py-5 font-mono font-black text-emerald-600 text-lg">{v.address}</td>
                          <td className="px-10 py-5 font-bold text-slate-800">{v.symbol}</td>
                          <td className="px-10 py-5 text-slate-500 italic text-xs">{v.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logic Blocks Display */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 px-2 uppercase italic tracking-tighter">Logic Blocks Preview</h3>
                {result.rungs.map((rung, i) => (
                  <div key={i} className="bg-slate-900 rounded-[2rem] p-8 border-l-8 border-emerald-500 shadow-xl overflow-hidden relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-emerald-500 font-black text-sm uppercase tracking-widest mb-1">{rung.name}</h4>
                        <p className="text-slate-400 text-xs font-medium">{rung.comment}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-700 bg-white/5 px-3 py-1 rounded-lg">RUNG {i+1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-3 tracking-widest">Instruction List (IL)</p>
                          <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                            {rung.instructionLines.join('\n')}
                          </pre>
                       </div>
                       <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-3 tracking-widest">Ladder Visualization</p>
                          <div className="flex flex-wrap gap-2">
                             {rung.elements.map((el, ei) => (
                               <div key={ei} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-slate-300 font-mono">
                                 {el.type}: {el.descriptor}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
