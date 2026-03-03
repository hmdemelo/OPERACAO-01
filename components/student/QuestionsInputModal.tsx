'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuestionsInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (correct: number, total: number) => void;
    itemContent: string;
}

export function QuestionsInputModal({ isOpen, onClose, onSave, itemContent }: QuestionsInputModalProps) {
    const [correctCount, setCorrectCount] = useState<string>('');
    const [totalQuestions, setTotalQuestions] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const correct = parseInt(correctCount);
        const total = parseInt(totalQuestions);

        if (isNaN(correct) || isNaN(total)) {
            setError('Por favor, insira números válidos.');
            return;
        }
        if (correct < 0 || total < 0) {
            setError('Os valores devem ser positivos.');
            return;
        }
        if (correct > total) {
            setError('O número de acertos não pode ser maior que o total de questões.');
            return;
        }

        setError(null);
        onSave(correct, total);
        onClose();
        setCorrectCount('');
        setTotalQuestions('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registro de Performance</DialogTitle>
                    <DialogDescription>
                        Informe seu desempenho no bloco: <span className="font-semibold text-foreground">{itemContent}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="total" className="text-right">Total Questões</Label>
                        <Input
                            id="total"
                            type="number"
                            value={totalQuestions}
                            onChange={(e) => setTotalQuestions(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: 20"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="correct" className="text-right">Acertos</Label>
                        <Input
                            id="correct"
                            type="number"
                            value={correctCount}
                            onChange={(e) => setCorrectCount(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: 15"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded dark:bg-red-900/20 dark:text-red-400">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar e Concluir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
