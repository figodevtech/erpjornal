import os
from PIL import Image

print("Diretório atual:", os.getcwd())
print("Arquivos no diretório:", os.listdir('.'))

# Cor azul escura do tema (#0f172a)
bg_color = (15, 23, 42, 255)

# Tentar encontrar o favicon
img_path = "RG ICON.png"
if not os.path.exists(img_path):
    # Tenta usar caminho absoluto se falhar
    img_path = "/home/italo/Área de trabalho/Jornal/erpjornal/RG ICON.png"

img = Image.open(img_path)

# Garantir formato RGBA
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Se a imagem não tiver transparência real (canal alfa totalmente opaco),
# podemos tentar substituir o fundo branco por transparente antes de aplicar o fundo azul.
# Vamos verificar se há transparência:
has_transparency = False
for x in range(img.width):
    for y in range(img.height):
        if img.getpixel((x, y))[3] < 255:
            has_transparency = True
            break
    if has_transparency:
        break

if not has_transparency:
    print("Imagem opaca detectada. Tratando pixels brancos como transparentes...")
    # Criar uma nova imagem transparente
    newData = []
    for item in img.getdata():
        # Se for muito próximo do branco, torna transparente
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    img.putdata(newData)

# Criar fundo azul escuro
bg = Image.new('RGBA', img.size, bg_color)

# Juntar imagem com o fundo
final_img = Image.alpha_composite(bg, img)

# Salvar no destino correto
final_img.save("src/app/icon.png", "PNG")
print("Favicon atualizado com sucesso em src/app/icon.png!")
