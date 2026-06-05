# Entrega 2 - Contrato Multisig (338683-280717)

## Descripción

Este proyecto implementa un contrato inteligente de firma múltiple (*multisig*) en Solidity.

El contrato permite que un conjunto de direcciones autorizadas (*signers*) pueda crear, aprobar, ejecutar y cancelar propuestas de transacción. Una propuesta solo puede ejecutarse cuando alcanza una cantidad mínima de aprobaciones configurada en el despliegue del contrato, llamada `threshold`.

Además, se implementó una interfaz web en React que permite conectarse con MetaMask e interactuar con el contrato desplegado en Sepolia.

## Decisión de diseño

Para esta versión se decidió utilizar un conjunto de signers fijo.

Esto significa que las direcciones autorizadas se definen al momento de desplegar el contrato y no pueden modificarse luego. Esta decisión simplifica la implementación y hace que el comportamiento del contrato sea más claro para esta entrega.

El constructor recibe:

* `initialSigners`: lista de direcciones autorizadas.
* `initialThreshold`: cantidad mínima de aprobaciones necesarias para ejecutar una propuesta.

Ejemplo:

```solidity
["0xSigner1", "0xSigner2", "0xSigner3"], 2
```

En este caso, existen tres signers y una propuesta necesita al menos dos aprobaciones para poder ejecutarse.

## Funcionalidades implementadas

El contrato `Multisig.sol` implementa las siguientes funcionalidades:

### Crear propuesta

Cualquier signer puede crear una propuesta indicando:

* dirección destino,
* valor en ETH,
* calldata opcional.

La propuesta queda inicialmente pendiente, con `approvals = 0`.

### Aprobar propuesta

Cada signer puede aprobar una propuesta pendiente.

El contrato valida que:

* quien aprueba sea signer,
* la propuesta exista,
* la propuesta no esté ejecutada,
* la propuesta no esté cancelada,
* el signer no haya aprobado previamente esa misma propuesta.

### Ejecutar propuesta

Una propuesta puede ejecutarse cuando alcanza al menos la cantidad de aprobaciones definida por el `threshold`.

El contrato valida que:

* quien ejecuta sea signer,
* la propuesta exista,
* no esté ejecutada,
* no esté cancelada,
* tenga suficientes aprobaciones.

Para enviar ETH o ejecutar calldata se utiliza:

```solidity
call{value: proposal.value}(proposal.data)
```

Antes de realizar la llamada externa, el contrato marca la propuesta como ejecutada. Esto sigue el patrón *checks-effects-interactions*.

### Cancelar propuesta

El proponente original puede cancelar una propuesta siempre que todavía no haya sido ejecutada.

El contrato valida que:

* quien cancela sea signer,
* la propuesta exista,
* no esté ejecutada,
* no esté cancelada,
* quien cancela sea el proponente original.

### Funciones de lectura

Se agregaron funciones auxiliares para facilitar la integración con el frontend:

* `getSigners()`
* `getProposal(uint256 proposalId)`
* `hasSignerApproved(uint256 proposalId, address signer)`

Estas funciones permiten consultar el estado del contrato y de las propuestas desde React.

## Eventos

El contrato emite eventos para las acciones principales:

```solidity
event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address destination, uint256 value, bytes data);
event ProposalApproved(uint256 indexed proposalId, address indexed signer);
event ProposalExecuted(uint256 indexed proposalId);
event ProposalCancelled(uint256 indexed proposalId);
```

## Estructura del proyecto

```text
contracts/
  Multisig.sol
  Multisig_test.sol
  MultisigTestHelpers.sol

frontend/
  src/
    abi/
      Multisig.json
    components/
      ContractInfo.tsx
      ProposalForm.tsx
      ProposalList.tsx
    config/
      contract.ts
    types/
      Proposal.ts
      ethereum.d.ts
    App.tsx
    App.css

README.md
```

## Compilación del contrato en Remix

Para compilar el contrato:

1. Abrir Remix:

```text
https://remix.ethereum.org/
```

2. Abrir el archivo:

```text
contracts/Multisig.sol
```

3. Ir a la pestaña **Solidity Compiler**.

4. Seleccionar una versión compatible con:

```solidity
pragma solidity >=0.8.2 <0.9.0;
```

En esta entrega se utilizó la versión:

```text
0.8.34
```

5. Presionar:

```text
Compile Multisig.sol
```

Resultado obtenido:

```text
Compilation successful
```

## Tests del contrato

Las pruebas del contrato se realizaron en Remix utilizando **Solidity Unit Testing**.

Archivo de tests:

```text
contracts/Multisig_test.sol
```

Tests implementados:

* `shouldCreateProposal`
* `shouldApproveProposal`
* `shouldExecuteProposal`
* `shouldRejectDuplicateApproval`
* `shouldRejectNonSignerApproval`

Resultado de los tests:

```text
Passed: 5
Failed: 0
```

Los tests validan que el contrato pueda crear, aprobar y ejecutar propuestas correctamente. También validan que se rechacen aprobaciones duplicadas y aprobaciones realizadas por cuentas que no son signers.

## Despliegue del contrato

En esta entrega se utilizó Remix como herramienta principal para compilar, testear y desplegar el contrato.

Por este motivo, no se incluye un script automatizado de despliegue con Hardhat o Foundry. El despliegue se realiza manualmente desde Remix, que fue el toolchain utilizado durante el desarrollo.

### Despliegue local en Remix

Para desplegar localmente:

1. Ir a la pestaña **Deploy & Run Transactions**.
2. Seleccionar el ambiente:

```text
Remix VM
```

3. En el constructor completar:

```text
initialSigners:
["0xSigner1","0xSigner2","0xSigner3"]

initialThreshold:
2
```

4. Presionar **Deploy**.

### Despliegue en Sepolia

Para desplegar en Sepolia:

1. Abrir MetaMask.
2. Seleccionar la red:

```text
Sepolia Testnet
```

3. En Remix, ir a **Deploy & Run Transactions**.
4. En `Environment`, seleccionar:

```text
Browser Extension - Sepolia Testnet - MetaMask
```

5. En el constructor completar la lista de signers y el threshold.
6. Presionar **Deploy** y confirmar la transacción en MetaMask.

## Contrato desplegado en Sepolia

Dirección del contrato desplegado:

```text
0x5fC762D70108e3bb7E41B3025e03A0ED7cadc0E4
```

Wallets utilizadas como signers:

```text
0xedf73600515273AE1c08B771d52B895d394D7E49
0x2bfc49015C23B232A78A834627C74c7d8e24b23D
0x40b0DCa0dBb34F58927348c33541B09E56D48481
```

Threshold configurado:

```text
2
```

Esto significa que existen tres signers autorizados y se necesitan dos aprobaciones para ejecutar una propuesta.

## Prueba manual realizada en Sepolia

Se probó el flujo completo sobre Sepolia:

1. Consultar la información inicial del contrato.
2. Crear una propuesta.
3. Aprobar la propuesta con Account 1.
4. Aprobar la misma propuesta con Account 2.
5. Ejecutar la propuesta luego de alcanzar el threshold.
6. Consultar el estado final de la propuesta.

Funciones consultadas inicialmente:

```solidity
getSigners()
threshold()
proposalCount()
```

Luego se creó la propuesta `0` con:

```solidity
createProposal(destination, 0, "0x")
```

La propuesta fue creada por:

```text
0xedf73600515273AE1c08B771d52B895d394D7E49
```

La dirección destino fue:

```text
0x40b0DCa0dBb34F58927348c33541B09E56D48481
```

Resultado final de `getProposal(0)`:

```text
proposer: 0xedf73600515273AE1c08B771d52B895d394D7E49
destination: 0x40b0DCa0dBb34F58927348c33541B09E56D48481
value: 0
data: 0x
approvals: 2
executed: true
cancelled: false
```

Esto confirma que la propuesta fue creada, aprobada por dos signers distintos y ejecutada correctamente en Sepolia.

## Frontend

El frontend fue implementado en React con TypeScript utilizando Vite.

La interfaz permite:

* conectar una wallet con MetaMask,
* verificar si la wallet conectada es signer,
* mostrar la dirección del contrato desplegado,
* mostrar la lista de signers,
* mostrar el threshold configurado,
* listar todas las propuestas,
* mostrar ID, destino, valor, aprobaciones y estado de cada propuesta,
* crear nuevas propuestas,
* aprobar propuestas pendientes,
* ejecutar propuestas cuando alcanzan el threshold,
* cancelar propuestas pendientes si la wallet conectada es el proponente original,
* deshabilitar acciones cuando no corresponden.

El frontend utiliza el ABI del contrato para interactuar con Sepolia.

ABI utilizado:

```text
frontend/src/abi/Multisig.json
```

Dirección del contrato configurada en el frontend:

```text
frontend/src/config/contract.ts
```

## Ejecución del frontend

Para ejecutar el frontend localmente:

1. Entrar a la carpeta del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

4. Abrir en el navegador la URL indicada por Vite, por ejemplo:

```text
http://localhost:5173/
```

5. Conectar MetaMask en la red Sepolia.

## Verificación de TypeScript y build

Se ejecutó el build del frontend con:

```bash
npm run build
```

Resultado:

```text
tsc -b && vite build
✓ built
```

El build terminó correctamente, sin errores de TypeScript.

Durante el build apareció una advertencia indicando que algunos chunks superan los 500 kB luego de la minificación. Esta advertencia no impide la compilación ni la ejecución del frontend. Se debe principalmente al uso de dependencias como `ethers`.

## Flujo probado desde el frontend

Desde la interfaz React se verificó que:

* se muestra correctamente la información del contrato,
* se muestra la wallet conectada,
* se detecta si la wallet conectada es signer,
* se listan las propuestas existentes,
* la propuesta `0` aparece como ejecutada,
* las propuestas pendientes muestran botones de aprobar, ejecutar y cancelar según corresponda,
* el botón de ejecutar solo queda habilitado cuando se alcanza el threshold.

## Integrantes

* Martina Rebellato - 338683
* Lucia Mendez - 280717