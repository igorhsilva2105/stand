        const popularGames = [
            { title: "PEAK", imageUrl: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=PEAK" },
            { title: "NIGHTREIGN", imageUrl: "https://placehold.co/600x400/7C3AED/FFFFFF?text=NIGHTREIGN" },
            { title: "ELDEN RING", imageUrl: "https://placehold.co/600x400/10B981/FFFFFF?text=ELDEN+RING" },
            { title: "CYBERPUNK 2077", imageUrl: "https://placehold.co/600x400/F59E0B/000000?text=CYBERPUNK" },
            { title: "STARFIELD", imageUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=STARFIELD" },
        ];

        // Função para criar um cartão de jogo
        function createGameCard(game) {
            return `
                <div class="rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer">
                    <img src="${game.imageUrl}" alt="${game.title}" class="w-full h-40 object-cover" />
                    <div class="p-3">
                        <h3 class="text-white font-semibold truncate">${game.title}</h3>
                    </div>
                </div>
            `;
        }

        // Adiciona os cartões de jogo à grade
        document.addEventListener('DOMContentLoaded', () => {
            const grid = document.getElementById('popular-games-grid');
            let gridHTML = '';
            for (const game of popularGames) {
                gridHTML += createGameCard(game);
            }
            grid.innerHTML = gridHTML;
        });