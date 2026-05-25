character/

----------------------------------------------

Character.types.ts

Esse arquivo existe para:
> Definir tipos e contratos.

Ele deve conter:
- CharacterType
- CharacterId
- Estrutura de BaseStats
- Interface do CharacterProps

Ele não contém lógica.
Só definição estrutural.

Ele responde à pergunta:
Como um Character é estruturado?

Ele deve definir algo como:
- Tipo do personagem
- Estrutura de baseStats
- Estrutura geral da entidade

Sem lógica ainda.

----------------------------------------------

Character.ts

Esse é o arquivo principal.

Ele deve conter:
> A implementação da entidade Character.

Ele será responsável por:
- Criar personagem
- Armazenar estado interno
- Manipular modifiers
- Expor dados

Ele pode:
- Ter constructor
- Ter métodos como addModifier
- Ter método removeModifier

Mas não deve conter algoritmo de resolução matemática pesada.

Ele responde à pergunta:
Como o Character se comporta?

----------------------------------------------

